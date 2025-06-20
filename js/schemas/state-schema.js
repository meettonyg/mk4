/**
 * State Schema Definitions
 * Defines the structure and validation rules for the Media Kit Builder state
 */

export const stateSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    required: ["layout", "components", "globalSettings"],
    properties: {
        layout: {
            type: "array",
            description: "Ordered array of component IDs",
            items: {
                type: "string",
                pattern: "^[a-zA-Z0-9_-]+$",
                minLength: 1,
                maxLength: 100
            },
            uniqueItems: true
        },
        components: {
            type: "object",
            description: "Map of component ID to component data",
            patternProperties: {
                "^[a-zA-Z0-9_-]+$": {
                    type: "object",
                    required: ["id", "type"],
                    properties: {
                        id: {
                            type: "string",
                            pattern: "^[a-zA-Z0-9_-]+$"
                        },
                        type: {
                            type: "string",
                            enum: [
                                "hero",
                                "topics",
                                "testimonials",
                                "faq",
                                "stats",
                                "features",
                                "cta",
                                "gallery",
                                "video",
                                "map",
                                "team",
                                "pricing",
                                "newsletter",
                                "social",
                                "custom"
                            ]
                        },
                        props: {
                            type: "object",
                            description: "Component-specific properties"
                        },
                        data: {
                            type: "object",
                            description: "Component data (legacy support)"
                        },
                        metadata: {
                            type: "object",
                            properties: {
                                created: {
                                    type: "string",
                                    format: "date-time"
                                },
                                updated: {
                                    type: "string",
                                    format: "date-time"
                                },
                                version: {
                                    type: "string"
                                }
                            }
                        }
                    },
                    additionalProperties: false
                }
            },
            additionalProperties: false
        },
        globalSettings: {
            type: "object",
            properties: {
                theme: {
                    type: "object",
                    properties: {
                        primaryColor: {
                            type: "string",
                            pattern: "^#[0-9A-Fa-f]{6}$"
                        },
                        secondaryColor: {
                            type: "string",
                            pattern: "^#[0-9A-Fa-f]{6}$"
                        },
                        fontFamily: {
                            type: "string"
                        },
                        fontSize: {
                            type: "string",
                            enum: ["small", "medium", "large"]
                        }
                    }
                },
                layout: {
                    type: "object",
                    properties: {
                        maxWidth: {
                            type: "string"
                        },
                        spacing: {
                            type: "string",
                            enum: ["compact", "normal", "spacious"]
                        },
                        alignment: {
                            type: "string",
                            enum: ["left", "center", "right"]
                        }
                    }
                },
                advanced: {
                    type: "object",
                    properties: {
                        customCSS: {
                            type: "string",
                            maxLength: 10000
                        },
                        customJS: {
                            type: "string",
                            maxLength: 10000
                        }
                    }
                }
            },
            additionalProperties: true
        },
        version: {
            type: "string",
            description: "State schema version",
            pattern: "^\\d+\\.\\d+\\.\\d+$"
        }
    },
    additionalProperties: false
};

/**
 * Transaction schemas for different state operations
 */
export const transactionSchemas = {
    ADD_COMPONENT: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "ADD_COMPONENT" },
            payload: {
                type: "object",
                required: ["id", "type"],
                properties: {
                    id: { type: "string", pattern: "^[a-zA-Z0-9_-]+$" },
                    type: { type: "string" },
                    props: { type: "object" },
                    data: { type: "object" }
                }
            }
        }
    },
    
    REMOVE_COMPONENT: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "REMOVE_COMPONENT" },
            payload: { type: "string", pattern: "^[a-zA-Z0-9_-]+$" }
        }
    },
    
    UPDATE_COMPONENT: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "UPDATE_COMPONENT" },
            payload: {
                type: "object",
                required: ["componentId", "newProps"],
                properties: {
                    componentId: { type: "string", pattern: "^[a-zA-Z0-9_-]+$" },
                    newProps: { type: "object" }
                }
            }
        }
    },
    
    MOVE_COMPONENT: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "MOVE_COMPONENT" },
            payload: {
                type: "object",
                required: ["componentId", "direction"],
                properties: {
                    componentId: { type: "string", pattern: "^[a-zA-Z0-9_-]+$" },
                    direction: { enum: ["up", "down"] }
                }
            }
        }
    },
    
    SET_LAYOUT: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "SET_LAYOUT" },
            payload: {
                type: "array",
                items: { type: "string", pattern: "^[a-zA-Z0-9_-]+$" }
            }
        }
    },
    
    SET_STATE: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "SET_STATE" },
            payload: stateSchema
        }
    },
    
    UPDATE_GLOBAL_SETTINGS: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "UPDATE_GLOBAL_SETTINGS" },
            payload: { type: "object" }
        }
    }
};

/**
 * Migration schemas for version upgrades
 */
export const migrationSchemas = {
    "1.0.0_to_2.0.0": {
        description: "Migrate from legacy state structure to enhanced structure",
        transform: (oldState) => {
            return {
                layout: oldState.layout || [],
                components: oldState.components || {},
                globalSettings: oldState.globalSettings || {},
                version: "2.0.0"
            };
        }
    }
};

/**
 * Validation constraints
 */
export const validationConstraints = {
    maxComponents: 100,
    maxLayoutDepth: 10,
    maxComponentIdLength: 100,
    maxCustomCSSLength: 10000,
    maxCustomJSLength: 10000,
    supportedComponentTypes: [
        "hero", "topics", "testimonials", "faq", "stats",
        "features", "cta", "gallery", "video", "map",
        "team", "pricing", "newsletter", "social", "custom"
    ]
};

/**
 * Default state structure
 */
export const defaultState = {
    layout: [],
    components: {},
    globalSettings: {
        theme: {
            primaryColor: "#2196F3",
            secondaryColor: "#FFC107",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "medium"
        },
        layout: {
            maxWidth: "1200px",
            spacing: "normal",
            alignment: "center"
        },
        advanced: {
            customCSS: "",
            customJS: ""
        }
    },
    version: "2.0.0"
};
