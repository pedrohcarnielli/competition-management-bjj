export const swaggerDocument = {
    openapi: "3.0.3",
    info: {
        title: "Competition Management BJJ API",
        version: "1.0.0",
        description: "API para gerenciamento de usuários, aprovações e graduações de competições de BJJ.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Servidor local"
        },
        {
            url: "https://<YOUR_FIREBASE_PROJECT>.cloudfunctions.net",
            description: "Firebase Functions remoto"
        }
    ],
    paths: {
        "/health": {
            get: {
                summary: "Verificar status da API",
                responses: {
                    "200": {
                        description: "API está ativa"
                    }
                }
            }
        },
        "/health/email": {
            get: {
                summary: "Verificar saúde do envio de e-mails",
                responses: {
                    "200": {
                        description: "Fila de e-mails acessível",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string" },
                                        email: {
                                            type: "object",
                                            properties: {
                                                healthy: { type: "boolean" },
                                                provider: { type: "string" },
                                                collection: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "503": {
                        description: "Falha na verificação da fila de e-mails"
                    }
                }
            }
        },
        "/getUsers": {
            get: {
                summary: "Listar usuários ativos",
                parameters: [
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Lista de usuários",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/User" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/getUserById": {
            get: {
                summary: "Obter usuário por ID",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Usuário encontrado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" }
                            }
                        }
                    }
                }
            }
        },
        "/getUserHistory": {
            get: {
                summary: "Obter histórico de usuário",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Histórico do usuário",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { type: "object" } }
                            }
                        }
                    }
                }
            }
        },
        "/createUserFunction": {
            post: {
                summary: "Criar usuário",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UserPayload" }
                        }
                    }
                },
                parameters: [
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "201": {
                        description: "Usuário criado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" }
                            }
                        }
                    }
                }
            }
        },
        "/updateUserFunction": {
            put: {
                summary: "Atualizar usuário",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
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
                    "200": {
                        description: "Usuário atualizado",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" }
                            }
                        }
                    }
                }
            }
        },
        "/deleteUserFunction": {
            delete: {
                summary: "Deletar usuário",
                parameters: [
                    {
                        name: "id",
                        in: "query",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "204": {
                        description: "Usuário excluído"
                    }
                }
            }
        },
        "/login": {
            post: {
                summary: "Login Firebase",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    password: { type: "string" }
                                },
                                required: ["email", "password"]
                            }
                        }
                    }
                },
                parameters: [
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Token Firebase retornado",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        token: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/getApprovalsFunction": {
            get: {
                summary: "Listar aprovações pendentes",
                parameters: [
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Lista de aprovações",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { type: "object" } }
                            }
                        }
                    }
                }
            }
        },
        "/respondApprovalFunction": {
            post: {
                summary: "Responder aprovação",
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
                parameters: [
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Aprovação atualizada",
                        content: {
                            "application/json": {
                                schema: { type: "object" }
                            }
                        }
                    }
                }
            }
        },
        "/getGraduations": {
            get: {
                summary: "Listar graduações válidas",
                parameters: [
                    {
                        name: "birthDate",
                        in: "query",
                        required: true,
                        schema: { type: "string", format: "date" }
                    },
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Graduações válidas para a idade",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        age: { type: "integer" },
                                        allowedGraduations: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/getRoles": {
            get: {
                summary: "Listar roles disponíveis",
                parameters: [
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Lista de roles disponíveis",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        availableRoles: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/getUsersByRole": {
            get: {
                summary: "Listar usuários filtrados por role",
                parameters: [
                    {
                        name: "role",
                        in: "query",
                        required: false,
                        schema: { type: "string" },
                        description: "Role para filtrar usuários (opcional)"
                    },
                    {
                        name: "x-api-key",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "x-tenant-id",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    },
                    {
                        name: "Authorization",
                        in: "header",
                        required: true,
                        schema: { type: "string" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Lista de usuários filtrados por role",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            fullName: { type: "string" },
                                            email: { type: "string", format: "email" },
                                            roles: {
                                                type: "array",
                                                items: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            UserPayload: {
                type: "object",
                properties: {
                    fullName: { type: "string" },
                    birthDate: { type: "string", format: "date" },
                    weight: { type: "number" },
                    graduation: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    documentNumber: { type: "string" },
                    roles: {
                        type: "array",
                        items: { type: "string" }
                    },
                    responsibleLegalEmail: { type: "string", format: "email" },
                    technicalResponsibleEmail: { type: "string", format: "email" },
                    password: { type: "string" },
                    photoBase64: { type: "string" }
                },
                required: ["fullName", "birthDate", "weight", "graduation", "email", "phone", "roles"]
            },
            User: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    fullName: { type: "string" },
                    birthDate: { type: "string", format: "date" },
                    weight: { type: "number" },
                    graduation: { type: "string" },
                    photo: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    documentNumber: { type: "string" },
                    roles: { type: "array", items: { type: "string" } },
                    responsibleLegalEmail: { type: "string", format: "email" },
                    technicalResponsibleEmail: { type: "string", format: "email" },
                    deletedAt: { type: "string", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    updatedBy: {
                        type: "object",
                        properties: {
                            uid: { type: "string" },
                            email: { type: "string", format: "email" }
                        }
                    },
                    history: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                timestamp: { type: "string", format: "date-time" },
                                data: { type: "object" }
                            }
                        }
                    }
                }
            }
        }
    }
};
