output "cluster_name" {
  description = "Nome do cluster Kind"
  value       = kind_cluster.this.name
}

output "cluster_endpoint" {
  description = "Endpoint da API do cluster"
  value       = kind_cluster.this.endpoint
}

output "kubeconfig_path" {
  description = "Caminho do kubeconfig para kubectl"
  value       = pathexpand(var.kubeconfig_path)
}

output "kubectl_context" {
  description = "Contexto kubectl do cluster"
  value       = "kind-${var.cluster_name}"
}

output "namespace" {
  description = "Namespace da aplicacao"
  value       = kubernetes_namespace.app.metadata[0].name
}
