BASE.require([
    "BASE.collections.Hashmap",
    "BASE.data.Edm"
], function () {

    var Hashmap = BASE.collections.Hashmap;
    var escapeSingleQuotes = function (value) {
        if (typeof value !== "string") {
            value = value.toString();
        }
        return value.replace("'", "''");
    };

    var findPrimaryKeys = function (properties) {
        return filterReleventProperties(properties).filter(function (key) {
            if (properties[key].primaryKeyRelationships.length > 0) {
                return true;
            }
            return false;
        });
    };

    var getDefaultValue = function (model, property) {
        var defaultValue = null;
        var getter = model.properties[property].defaultValue;

        if (typeof getter === "function") {
            defaultValue = getter();
        } else if (typeof getter !== "undefined") {
            defaultValue = getter;
        }

        return defaultValue;
    };

    var defaultTypesMap = new Hashmap();
    defaultTypesMap.add(Double, "REAL");
    defaultTypesMap.add(Float, "REAL");
    defaultTypesMap.add(Integer, "INTEGER");
    defaultTypesMap.add(Byte, "INTEGER");
    defaultTypesMap.add(Binary, "INTEGER");
    defaultTypesMap.add(Boolean, "NUMERIC");
    defaultTypesMap.add(Date, "NUMERIC");
    defaultTypesMap.add(DateTimeOffset, "NUMERIC");
    defaultTypesMap.add(Decimal, "NUMERIC");
    defaultTypesMap.add(Enum, "NUMERIC");
    defaultTypesMap.add(String, "TEXT");

    var defaultDataConverter = {
        convertString: function (value) {
            return "'" + escapeSingleQuotes(value) + "'";
        },
        convertContainsString: function (value) {
            return "'%" + escapeSingleQuotes(value) + "%'";
        },
        convertStartsWithString: function (value) {
            return "'" + escapeSingleQuotes(value) + "%'";
        },
        convertEndsWithString: function (value) {
            return "'%" + escapeSingleQuotes(value) + "'";
        },
        convertNumber: function (value) {
            return value.toString();
        },
        convertBoolean: function (value) {
            return value ? 1 : 0;
        },
        convertDate: function (value) {
            return value.getTime();
        }
    };

    BASE.namespace("BASE.sql");

    BASE.sql.StatementCreator = function (edm, typesMap, dataConverter) {
        var self = this;
        typesMap = typesMap || defaultTypesMap;
        dataConverter = dataConverter || defaultDataConverter;

        var sqlizePrimitive = function (value) {
            if (typeof value === "string") {
                return dataConverter.convertString(value);
            } else if (typeof value === "number") {
                return dataConverter.convertNumber(value);
            } else if (typeof value === "boolean") {
                return dataConverter.convertBoolean(value);
            } else if (value instanceof Date) {
                return dataConverter.convertDate(value);
            } else if (value === null) {
                return "NULL";
            }
        };

        var filterReleventProperties = function (properties) {
            return Object.keys(properties).filter(function (key) {
                var property = properties[key];
                if (typeof property.type !== "undefined") {
                    return typesMap.hasKey(property.type);
                }
                return false;
            });

        };

        self.createTableClause = function (model) {
            return "CREATE TABLE " + model.collectionName + self.createColumnDefinition(model);
        };

        self.createColumnDefinition = function (model) {
            var foreignKeys = [];
            var columns = [];
            var indexes = new Hashmap();
            var primaryKeys = [];
            var properties = model.properties;

            Object.keys(properties).forEach(function (property) {
                if (properties[property].primaryKey) {
                    primaryKeys.push(property);
                }
            });

            Object.keys(model.properties).forEach(function (key) {
                var property = model.properties[key];
                if (typeof property.type !== "undefined") {
                    var sqlType = typesMap.get(property.type);
                    var primaryKey = "";

                    if (sqlType !== null) {
                        if (property.primaryKey) {
                            indexes.add(key, key);

                            if (primaryKeys.length === 1) {
                                primaryKey = " PRIMARY KEY";
                            }

                            if (property.autoIncrement) {
                                primaryKey += " AUTOINCREMENT";
                            }
                        }
                        columns.push(key + " " + sqlType + primaryKey);
                    }
                    if (property.foreignKeyRelationship) {
                        indexes.add(property.foreignKeyRelationship.withForeignKey, property.foreignKeyRelationship.withForeignKey);
                        var sourceModel = edm.getModelByType(property.foreignKeyRelationship.type);
                        foreignKeys.push("FOREIGN KEY (" + property.foreignKeyRelationship.withForeignKey + ") REFERENCES " + sourceModel.collectionName + "(" + property.foreignKeyRelationship.hasKey + ")");
                    }
                }
            });
            primaryKeysStatement = "";
            if (primaryKeys.length > 1) {
                primaryKeysStatement = ", PRIMARY KEY (" + primaryKeys.join(", ") + ")";
            }

            var indexValues = indexes.getValues();
            var definition = "(\n\t";
            definition += columns.concat(foreignKeys).join(", \n\t");
            definition += primaryKeysStatement;
            definition += "\n)";
            return definition;
        };

        self.createIndexes = function (model) {
            var indexes = new Hashmap();

            Object.keys(model.properties).forEach(function (key) {
                var property = model.properties[key];
                if (typeof property.type !== "undefined") {
                    var sqlType = typesMap.get(property.type);

                    if (sqlType !== null) {
                        if (property.primaryKeyRelationships.length > 0 || property.primaryKey) {
                            indexes.add(key, key);
                        }
                    }
                    if (property.foreignKeyRelationship) {
                        indexes.add(property.foreignKeyRelationship.withForeignKey, property.foreignKeyRelationship.withForeignKey);
                    }
                }
            });

            var indexValues = indexes.getValues();
            definition = "CREATE INDEX IF NOT EXISTS " + indexValues.join("_") + " ON " + model.collectionName + " (\n\t" + indexValues.join(", \n\t") + "\n)";
            return definition;
        };

    };

});