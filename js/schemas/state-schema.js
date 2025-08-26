/**
 * State Schema Definitions
 * Defines the structure and validation rules for the Media Kit Builder state
 */

const stateSchema = {
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
                            description: "Component type identifier",
                            minLength: 1,
                            maxLength: 50
                            // Removed enum restriction to allow all component types
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
        sections: {
            type: "array",
            description: "Array of section configurations for Phase 3",
            items: {
                type: "object",
                required: ["section_id", "section_type"],
                properties: {
                    section_id: {
                        type: "string",
                        pattern: "^[a-zA-Z0-9_-]+$"
                    },
                    section_type: {
                        type: "string",
                        enum: ["full_width", "two_column", "three_column", "grid", "hero"]
                    },
                    layout: {
                        type: "object",
                        properties: {
                            width: { type: "string" },
                            max_width: { type: "string" },
                            padding: { type: "string" },
                            columns: { type: "integer", minimum: 1, maximum: 12 },
                            column_gap: { type: "string" },
                            row_gap: { type: "string" },
                            display: { type: "string" },
                            align_items: { type: "string" },
                            justify_content: { type: "string" },
                            grid_template_columns: { type: "string" },
                            min_height: { type: "string" }
                        }
                    },
                    section_options: {
                        type: "object",
                        properties: {
                            background_type: {
                                type: "string",
                                enum: ["none", "color", "gradient"]
                            },
                            background_color: {
                                type: "string",
                                pattern: "^(#[0-9A-Fa-f]{6}|transparent)$"
                            },
                            spacing_top: {
                                type: "string",
                                enum: ["none", "small", "medium", "large"]
                            },
                            spacing_bottom: {
                                type: "string",
                                enum: ["none", "small", "medium", "large"]
                            }
                        }
                    },
                    responsive: {
                        type: "object",
                        properties: {
                            mobile: { type: "object" },
                            tablet: { type: "object" }
                        }
                    },
                    components: {
                        type: "array",
                        description: "Components assigned to this section",
                        items: {
                            type: "object",
                            required: ["component_id"],
                            properties: {
                                component_id: {
                                    type: "string",
                                    pattern: "^[a-zA-Z0-9_-]+$"
                                },
                                column: {
                                    type: "integer",
                                    minimum: 1
                                },
                                order: {
                                    type: "integer",
                                    minimum: 0
                                },
                                assigned_at: { type: "number" }
                            }
                        }
                    },
                    created_at: { type: "number" },
                    updated_at: { type: "number" }
                },
                additionalProperties: false
            }
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
const transactionSchemas = {
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
    },
    
    // PHASE 3: Section operation schemas
    UPDATE_SECTIONS: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "UPDATE_SECTIONS" },
            payload: {
                type: "array",
                items: {
                    type: "object",
                    required: ["section_id", "section_type"],
                    properties: {
                        section_id: { type: "string" },
                        section_type: { type: "string" }
                    }
                }
            }
        }
    },
    
    ADD_SECTION: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "ADD_SECTION" },
            payload: {
                type: "object",
                required: ["section_id", "section_type"],
                properties: {
                    section_id: { type: "string" },
                    section_type: { type: "string" }
                }
            }
        }
    },
    
    REMOVE_SECTION: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "REMOVE_SECTION" },
            payload: { type: "string" }
        }
    },
    
    UPDATE_SECTION: {
        type: "object",
        required: ["type", "payload"],
        properties: {
            type: { const: "UPDATE_SECTION" },
            payload: {
                type: "object",
                required: ["sectionId", "updates"],
                properties: {
                    sectionId: { type: "string" },
                    updates: { type: "object" }
                }
            }
        }
    }
};

/**
 * Migration schemas for version upgrades
 */
const migrationSchemas = {
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
const validationConstraints = {
    maxComponents: 100,
    maxLayoutDepth: 10,
    maxComponentIdLength: 100,
    maxCustomCSSLength: 10000,
    maxCustomJSLength: 10000,
    // Removed supportedComponentTypes - now accepting all component types
    // Components are validated by the component discovery system instead
};

/**
 * Default state structure
 */
const defaultState = {
    layout: [],
    components: {},
    sections: [],
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
    version: "3.0.0"
};

// ROOT FIX: Make schemas available globally instead of ES6 exports
window.stateSchema = stateSchema;
window.transactionSchemas = transactionSchemas;
window.migrationSchemas = migrationSchemas;
window.validationConstraints = validationConstraints;
window.defaultState = defaultState;

// Combined schemas object for easier access
window.GMKBSchemas = {
    stateSchema,
    transactionSchemas,
    migrationSchemas,
    validationConstraints,
    defaultState
};

console.log('✅ State Schema: Available globally and ready');
