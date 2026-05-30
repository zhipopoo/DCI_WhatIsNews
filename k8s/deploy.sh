#!/usr/bin/env bash
# ============================================================
# WhatIsNews K8s Deploy Script
# Usage: ./k8s/deploy.sh [namespace]
#   每次提交后执行此脚本即可完成部署
# ============================================================
set -euo pipefail

NAMESPACE="${1:-dci-news}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_CHART="$SCRIPT_DIR/backend"
FRONTEND_CHART="$SCRIPT_DIR/frontend"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ---------- Pre-checks ----------
command -v kubectl >/dev/null 2>&1 || error "kubectl not found"
command -v helm >/dev/null 2>&1   || error "helm not found"

kubectl cluster-info --request-timeout=5s >/dev/null 2>&1 || error "Cannot connect to K8s cluster"

# ---------- Namespace ----------
if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
  info "Namespace $NAMESPACE already exists"
else
  info "Creating namespace $NAMESPACE..."
  kubectl create namespace "$NAMESPACE"
fi

# ---------- Secret ----------
info "Applying secrets..."
kubectl apply -f "$SCRIPT_DIR/secrets.yaml" -n "$NAMESPACE"

# ---------- PostgreSQL ----------
info "Deploying PostgreSQL..."
kubectl apply -f "$SCRIPT_DIR/postgres/pvc.yaml" -n "$NAMESPACE"
kubectl apply -f "$SCRIPT_DIR/postgres/service.yaml" -n "$NAMESPACE"
kubectl apply -f "$SCRIPT_DIR/postgres/statefulset.yaml" -n "$NAMESPACE"

info "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=120s 2>/dev/null || {
  warn "PostgreSQL not ready within 120s, continuing anyway..."
}

# ---------- Backend (Helm) ----------
if helm list -n "$NAMESPACE" | grep -q "news-backend"; then
  info "Upgrading backend Helm release..."
  helm upgrade news-backend "$BACKEND_CHART" -n "$NAMESPACE" --wait --timeout 5m
else
  info "Installing backend Helm release..."
  helm install news-backend "$BACKEND_CHART" -n "$NAMESPACE" --wait --timeout 5m
fi

info "Rolling out backend restart to pick up new image..."
kubectl rollout restart deployment/news-backend -n "$NAMESPACE" 2>/dev/null || true
kubectl rollout status deployment/news-backend -n "$NAMESPACE" --timeout=5m

# ---------- Frontend (Helm) ----------
if helm list -n "$NAMESPACE" | grep -q "news-frontend"; then
  info "Upgrading frontend Helm release..."
  helm upgrade news-frontend "$FRONTEND_CHART" -n "$NAMESPACE" --wait --timeout 3m
else
  info "Installing frontend Helm release..."
  helm install news-frontend "$FRONTEND_CHART" -n "$NAMESPACE" --wait --timeout 3m
fi

info "Rolling out frontend restart to pick up new image..."
kubectl rollout restart deployment/news-frontend -n "$NAMESPACE" 2>/dev/null || true
kubectl rollout status deployment/news-frontend -n "$NAMESPACE" --timeout=3m

# ---------- Summary ----------
echo ""
echo "============================================"
info "Deploy completed for namespace: $NAMESPACE"
echo "============================================"
echo ""
echo "Resources:"
kubectl get all -n "$NAMESPACE" -l 'app in (news-backend,news-frontend,postgres)' --no-headers 2>/dev/null || \
  kubectl get pods,svc -n "$NAMESPACE"
echo ""
info "Frontend service: $(kubectl get svc frontend-svc -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo 'pending')"
info "Backend service:  $(kubectl get svc backend-svc -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo 'pending')"
info "Postgres service: $(kubectl get svc postgres-svc -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo 'pending')"
