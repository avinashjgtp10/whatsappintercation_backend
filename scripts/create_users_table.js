const sequelize = require("../config/db");

const createUsersTable = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");

        const query = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255),
        email VARCHAR(255),
        organization VARCHAR(150),
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `;

        await sequelize.query(query);
        console.log("✅ users table created successfully (NO constraints).");

    } catch (error) {
        console.error("❌ Error creating users table:", error);
    } finally {
        await sequelize.close();
    }
};

createUsersTable();
