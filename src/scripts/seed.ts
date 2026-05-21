import pool from '../lib/db';
import { MOCK_SCHEMES } from '../constants';

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding...');

  try {
    // Loop through each mock scheme and insert it into the Postgres database
    for (const scheme of MOCK_SCHEMES) {
      console.log(`Inserting: ${scheme.name}`);

      const insertSql = `
        INSERT INTO schemes (
          title, 
          category, 
          benefits, 
          eligibility_criteria, 
          documents_required, 
          application_process, 
          deadline, 
          is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
      `;

      // Convert our old arrays into formats suitable for Postgres
      const benefitsText = scheme.description + "\n\nKey Benefits:\n" + scheme.benefits.join(', ');
      
      // Convert eligibility array into a JSONB object
      const eligibilityObj = scheme.eligibility.reduce((acc, curr, index) => {
        acc[`criterion_${index + 1}`] = curr;
        return acc;
      }, {} as Record<string, string>);

      const applicationProcessText = scheme.procedures.join('\n');

      // Convert string deadline to Date if it exists
      const deadlineDate = scheme.deadline ? new Date(scheme.deadline) : null;

      const params = [
        scheme.name,
        scheme.category,
        benefitsText,
        JSON.stringify(eligibilityObj), // Stored as JSONB
        scheme.documentation, // Stored as TEXT[] array
        applicationProcessText,
        deadlineDate,
        true // is_active
      ];

      await pool.query(insertSql, params);
    }

    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    // Close the connection pool so the script exits
    await pool.end();
  }
}

seedDatabase();
