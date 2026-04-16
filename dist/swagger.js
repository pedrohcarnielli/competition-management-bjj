"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
exports.swaggerDocument = {
    openapi: "3.0.3",
    info: {
        title: "Competition Management BJJ API",
        version: "1.0.0",
        description: "API REST para gerenciamento de atletas, aprovação de responsáveis, login e histórico de alterações.",
    },
    servers: [
        { url: "http://localhost:3000", description: "Local development" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            apiKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "x-api-key"
            }
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    fullName: { type: "string" },
                    birthDate: { type: "string", format: "date" },
                    weight: { type: "number" },
                    graduation: { type: "string" },
                    photo: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    roles: { type: "array", items: { type: "string" } },
                    responsibleLegalEmail: { type: "string" },
                    technicalResponsibleEmail: { type: "string" },
                    deletedAt: { type: "string", format: "date-time" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    history: { type: "array", items: { $ref: "#/components/schemas/UserHistoryEntry" } }
                }
            },
            UserPayload: {
                type: "object",
                properties: {
                    fullName: { type: "string" },
                    birthDate: { type: "string", format: "date" },
                    weight: { type: "number" },
                    graduation: { type: "string" },
                    photoBase64: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    roles: { type: "array", items: { type: "string" } },
                    responsibleLegalEmail: { type: "string" },
                    technicalResponsibleEmail: { type: "string" },
                    password: { type: "string" }
                },
                required: ["fullName", "birthDate", "weight", "graduation", "email", "phone", "roles"]
            },
            LoginRequest: {
                type: "object",
                properties: {
                    email: { type: "string" },
                    password: { type: "string" }
                },
                required: ["email", "password"]
            },
            LoginResponse: {
                type: "object",
                properties: {
                    idToken: { type: "string" },
                    refreshToken: { type: "string" },
                    expiresIn: { type: "string" },
                    localId: { type: "string" },
                    email: { type: "string" }
                }
            },
            ApprovalRequest: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    type: { type: "string" },
                    requesterId: { type: "string" },
                    requesterEmail: { type: "string" },
                    responsibleEmail: { type: "string" },
                    status: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            UserHistoryEntry: {
                type: "object",
                properties: {
                    timestamp: { type: "string", format: "date-time" },
                    data: { $ref: "#/components/schemas/User" }
                }
            }
        }
    },
    paths: {
        "/users": {
            get: {
                summary: "Listar usuários ativos",
                security: [
                    { apiKeyAuth: [], bearerAuth: [] }
                ],
                responses: {
                    200: {
                        description: "Lista de usuários",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { $ref: "#/components/schemas/User" } }
                            }
                        }
                    }
                }
            },
            post: {
                summary: "Criar usuário",
                security: [
                    { apiKeyAuth: [], bearerAuth: [] }
                ],
                parameters: [
                    { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
                    { name: "x-tenant-id", in: "header", required: true, schema: { type: "string" } },
                    { name: "Authorization", in: "header", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UserPayload" }
                        }
                    }
                },
                responses: {
                    201: { description: "Usuário criado", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    400: { description: "Validação falhou" },
                    401: { description: "Acesso negado" }
                }
            }
        },
        "/users/{id}": {
            get: {
                summary: "Buscar usuário por id",
                security: [
                    { apiKeyAuth: [], bearerAuth: [] }
                ],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "Usuário encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    404: { description: "Usuário não encontrado" }
                }
            },
            put: {
                summary: "Atualizar usuário",
                security: [
                    { apiKeyAuth: [], bearerAuth: [] }
                ],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/UserPayload" } } }
                },
                responses: {
                    200: { description: "Usuário atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    400: { description: "Validação falhou" },
                    404: { description: "Usuário não encontrado" }
                }
            },
            delete: {
                summary: "Excluir usuário logicamente",
                security: [
                    { apiKeyAuth: [], bearerAuth: [] }
                ],
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    204: { description: "Usuário excluído" },
                    404: { description: "Usuário não encontrado" }
                }
            }
        },
        "/users/{id}/history": {
            get: {
                summary: "Buscar histórico de usuário",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "Histórico retornado", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/UserHistoryEntry" } } } } },
                    404: { description: "Usuário não encontrado" }
                }
            }
        },
        "/login": {
            post: {
                summary: "Fazer login e receber token Firebase",
                security: [
                    { apiKeyAuth: [] }
                ],
                parameters: [
                    { name: "x-api-key", in: "header", required: true, schema: { type: "string" } },
                    { name: "x-tenant-id", in: "header", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginRequest" }
                        }
                    }
                },
                responses: {
                    200: { description: "Login bem-sucedido", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
                    400: { description: "Requisição inválida" },
                    401: { description: "Credenciais inválidas" }
                }
            }
        },
        "/approvals": {
            get: {
                summary: "Listar solicitações de aprovação",
                responses: {
                    200: { description: "Lista de aprovações", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ApprovalRequest" } } } } }
                }
            }
        },
        "/approvals/{id}/respond": {
            post: {
                summary: "Responder solicitação de aprovação",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    approverEmail: { type: "string" },
                                    approve: { type: "boolean" }
                                },
                                required: ["approverEmail", "approve"]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Resposta registrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ApprovalRequest" } } } },
                    400: { description: "Requisição inválida" },
                    404: { description: "Solicitação não encontrada" }
                }
            }
        },
        "/graduations": {
            get: {
                summary: "Listar graduações válidas por data de nascimento",
                parameters: [{ name: "birthDate", in: "query", required: true, schema: { type: "string", format: "date" } }],
                responses: {
                    200: {
                        description: "Graduações válidas",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        age: { type: "number" },
                                        allowedGraduations: { type: "array", items: { type: "string" } }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: "birthDate é obrigatório" }
                }
            }
        }
    }
};
