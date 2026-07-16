package com.whatisnew.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.whatisnew.entity.MediaFile;
import com.whatisnew.repository.MediaFileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Service for probing and transcoding uploaded video files.
 * <p>
 * Uses the system {@code ffprobe} to detect the video codec and {@code ffmpeg}
 * to transcode non-H.264 videos to H.264/AVC in an MP4 container — the only
 * codec/container combination with universal browser support.
 * <p>
 * The transcode is <b>best-effort</b>: if probing or transcoding fails for any
 * reason, the original file and database record are kept unchanged. The upload
 * itself is never failed because of a transcode error.
 */
@Slf4j
@Service
public class VideoTranscodeService {

    private final MediaFileRepository mediaFileRepository;
    private final ObjectMapper objectMapper;
    private final String uploadDir;
    private final boolean enabled;
    private final String ffmpegPath;
    private final String ffprobePath;
    private final int crf;

    /** Codec names that indicate an H.264/AVC video stream — no transcode needed. */
    private static final Set<String> H264_CODEC_NAMES = Set.of("h264", "avc1", "avc");

    public VideoTranscodeService(
            MediaFileRepository mediaFileRepository,
            @Value("${file.upload-dir:./uploads}") String uploadDir,
            @Value("${file.transcode.enabled:true}") boolean enabled,
            @Value("${file.transcode.ffmpeg-path:}") String ffmpegPath,
            @Value("${file.transcode.ffprobe-path:}") String ffprobePath,
            @Value("${file.transcode.crf:23}") int crf) {
        this.mediaFileRepository = mediaFileRepository;
        this.objectMapper = new ObjectMapper();
        this.uploadDir = uploadDir;
        this.enabled = enabled;
        this.ffmpegPath = ffmpegPath;
        this.ffprobePath = ffprobePath;
        this.crf = crf;
    }

    /**
     * Process a newly-uploaded video file.
     * <p>
     * Probes the file with ffprobe to detect the video codec. If the codec is
     * not H.264/AVC, transcodes it to H.264 in an MP4 container. Populates
     * width/height metadata regardless. Updates the database record.
     *
     * @param mediaFile the saved MediaFile entity (must have storedName set)
     * @return the updated MediaFile (the original if no processing was needed
     *         or if processing failed)
     */
    public MediaFile processIfNeeded(MediaFile mediaFile) {
        // ---- guard checks ----
        if (!enabled) {
            log.debug("Video transcode is disabled, skipping: {}", mediaFile.getStoredName());
            return mediaFile;
        }

        if (!"VIDEO".equals(mediaFile.getFileType())) {
            return mediaFile;
        }

        Path inputPath = Paths.get(uploadDir, mediaFile.getStoredName());
        if (!Files.exists(inputPath)) {
            log.warn("Uploaded video file not found on disk, skipping transcode: {}", inputPath);
            return mediaFile;
        }

        String originalStoredName = mediaFile.getStoredName();

        try {
            // ---- probe with ffprobe ----
            VideoStreamInfo videoInfo = probeVideo(inputPath);
            if (videoInfo == null) {
                log.info("No video stream found in {}, keeping original", originalStoredName);
                return mediaFile;
            }

            // ---- populate width/height from probe ----
            mediaFile.setWidth(videoInfo.width());
            mediaFile.setHeight(videoInfo.height());

            log.info("Probed {}: codec={}, {}x{}",
                    originalStoredName, videoInfo.codecName(), videoInfo.width(), videoInfo.height());

            // ---- check if already H.264 ----
            if (isH264(videoInfo.codecName())) {
                log.debug("Video {} is already H.264, no transcode needed", originalStoredName);
                mediaFileRepository.save(mediaFile);
                return mediaFile;
            }

            // ---- transcode to H.264 ----
            log.info("Transcoding {} (codec={}) to H.264...", originalStoredName, videoInfo.codecName());

            String uuid = extractUuid(originalStoredName);
            Path tempOutputPath = Paths.get(uploadDir, uuid + "_tmp.mp4");
            Path finalOutputPath = Paths.get(uploadDir, uuid + ".mp4");

            transcodeToH264(inputPath, tempOutputPath);

            // ---- replace original with transcoded file ----
            Files.delete(inputPath);
            Files.move(tempOutputPath, finalOutputPath, StandardCopyOption.REPLACE_EXISTING);

            long newSize = Files.size(finalOutputPath);
            String newStoredName = uuid + ".mp4";

            mediaFile.setStoredName(newStoredName);
            mediaFile.setFilePath("/uploads/" + newStoredName);
            mediaFile.setFileSize(newSize);
            mediaFile.setMimeType("video/mp4");

            mediaFileRepository.save(mediaFile);

            log.info("Transcode complete: {} -> {} ({} bytes, H.264)",
                    originalStoredName, newStoredName, newSize);

            return mediaFile;

        } catch (Exception e) {
            log.warn("Video transcode failed for {}: keeping original (error: {})",
                    originalStoredName, e.getMessage());
            // Clean up any temp file that may have been left behind
            try {
                String uuid = extractUuid(originalStoredName);
                Files.deleteIfExists(Paths.get(uploadDir, uuid + "_tmp.mp4"));
            } catch (Exception ignored) {
                // best-effort cleanup
            }
            return mediaFile;
        }
    }

    // ---- private helpers ----

    /**
     * Run ffprobe and extract codec/width/height from the first video stream.
     *
     * @return VideoStreamInfo or null if no video stream was found or probing failed
     */
    private VideoStreamInfo probeVideo(Path filePath) {
        try {
            List<String> command = new ArrayList<>();
            command.add(resolveFfprobePath());
            command.add("-v");
            command.add("quiet");
            command.add("-print_format");
            command.add("json");
            command.add("-show_format");
            command.add("-show_streams");
            command.add(filePath.toAbsolutePath().toString());

            ProcessResult result = executeProcess(command, 30, TimeUnit.SECONDS);

            if (result.exitCode() != 0) {
                log.warn("ffprobe exited with code {} for {}: {}",
                        result.exitCode(), filePath.getFileName(), result.output());
                return null;
            }

            JsonNode root = objectMapper.readTree(result.output());
            JsonNode streams = root.get("streams");
            if (streams == null || !streams.isArray()) {
                return null;
            }

            for (JsonNode stream : streams) {
                String codecType = stream.has("codec_type") ? stream.get("codec_type").asText() : "";
                if ("video".equals(codecType)) {
                    String codecName = stream.has("codec_name") ? stream.get("codec_name").asText() : "unknown";
                    int width = stream.has("width") ? stream.get("width").asInt() : 0;
                    int height = stream.has("height") ? stream.get("height").asInt() : 0;
                    return new VideoStreamInfo(codecName.toLowerCase(), width, height);
                }
            }

            return null; // no video stream
        } catch (IOException e) {
            log.warn("ffprobe execution failed for {}: {}", filePath.getFileName(), e.getMessage());
            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("ffprobe was interrupted for {}", filePath.getFileName());
            return null;
        }
    }

    /**
     * Transcode the input file to H.264/AAC in an MP4 container.
     *
     * @throws IOException if the transcode fails
     */
    private void transcodeToH264(Path inputPath, Path outputPath) throws IOException, InterruptedException {
        List<String> command = new ArrayList<>();
        command.add(resolveFfmpegPath());
        command.add("-y");               // overwrite output without asking
        command.add("-i");
        command.add(inputPath.toAbsolutePath().toString());
        command.add("-c:v");
        command.add("libx264");          // H.264 video encoder
        command.add("-crf");
        command.add(String.valueOf(crf));
        command.add("-preset");
        command.add("medium");           // balanced speed vs compression
        command.add("-c:a");
        command.add("aac");              // AAC audio (universal browser support)
        command.add("-b:a");
        command.add("128k");
        command.add("-movflags");
        command.add("+faststart");       // moov atom at start for streaming

        // Limit to single thread to avoid CPU starvation when multiple uploads
        // happen concurrently. Remove or adjust if the server has dedicated capacity.
        command.add("-threads");
        command.add("1");

        command.add(outputPath.toAbsolutePath().toString());

        log.debug("Running ffmpeg: {}", String.join(" ", command));

        ProcessResult result = executeProcess(command, 300, TimeUnit.SECONDS);

        if (result.exitCode() != 0) {
            // Delete partial output
            try {
                Files.deleteIfExists(outputPath);
            } catch (IOException ignored) {
            }
            throw new IOException(
                    "ffmpeg exited with code " + result.exitCode() + ": " + truncate(result.output(), 500));
        }
    }

    /**
     * Execute a process, wait for it with a timeout, and capture its output.
     */
    private ProcessResult executeProcess(List<String> command, long timeout, TimeUnit unit)
            throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // merge stderr→stdout to avoid pipe deadlock

        Process process = pb.start();

        boolean finished = process.waitFor(timeout, unit);
        if (!finished) {
            process.destroyForcibly();
            throw new IOException("Process timed out after " + timeout + " " + unit.toString().toLowerCase());
        }

        String output = new String(process.getInputStream().readAllBytes());
        return new ProcessResult(process.exitValue(), output);
    }

    private boolean isH264(String codecName) {
        return H264_CODEC_NAMES.contains(codecName.toLowerCase());
    }

    private String resolveFfprobePath() {
        return (ffprobePath != null && !ffprobePath.isBlank()) ? ffprobePath : "ffprobe";
    }

    private String resolveFfmpegPath() {
        return (ffmpegPath != null && !ffmpegPath.isBlank()) ? ffmpegPath : "ffmpeg";
    }

    /**
     * Extract the UUID portion from a stored filename like "abc-123.mov" → "abc-123".
     */
    static String extractUuid(String storedName) {
        int dot = storedName.lastIndexOf('.');
        return dot > 0 ? storedName.substring(0, dot) : storedName;
    }

    private static String truncate(String s, int maxLen) {
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "...";
    }

    // ---- inner types ----

    private record VideoStreamInfo(String codecName, int width, int height) {}

    private record ProcessResult(int exitCode, String output) {}
}
