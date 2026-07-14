variable "cluster_name" {
  description = "Nome do cluster Kind"
  type        = string
  default     = "tech-challenge"
}

variable "namespace" {
  description = "Namespace Kubernetes da aplicacao"
  type        = string
  default     = "tech-challenge-namespace"
}

variable "node_image" {
  description = "Imagem dos nos Kind (kindest/node)"
  type        = string
  default     = "kindest/node:v1.32.2"
}

variable "kubeconfig_path" {
  description = "Caminho do kubeconfig gerado pelo cluster Kind"
  type        = string
  default     = "~/.kube/kind-tech-challenge"
}

variable "enable_metrics_server" {
  description = "Instala o metrics-server (necessario para HPA)"
  type        = bool
  default     = true
}
