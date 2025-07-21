/* eslint-disable no-console */
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Sample data for testing
const sampleCountries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Australia',
  'Japan',
  'Brazil',
];
const sampleCities = [
  'New York',
  'Los Angeles',
  'Toronto',
  'London',
  'Berlin',
  'Paris',
  'Sydney',
  'Tokyo',
];
const sampleBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
const sampleDevices = ['Desktop', 'Mobile', 'Tablet'];
const samplePages = [
  '/',
  '/dashboard',
  '/login',
  '/signup',
  '/about',
  '/pricing',
  '/features',
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

async function createDemoData() {
  try {
    console.log('🎲 Creating demo analytics data...\n');

    // Check if demo data already exists
    const existingVisits = await db('site_visits').count('id as count').first();

    if (parseInt(existingVisits.count) > 0) {
      const proceed = await new Promise(resolve => {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question(
          'Demo data already exists. Do you want to create more? (y/N): ',
          answer => {
            rl.close();
            resolve(
              answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
            );
          }
        );
      });

      if (!proceed) {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }

    // Generate site visits (last 30 days)
    console.log('📊 Generating site visits...');
    const visits = [];

    for (let i = 0; i < 1000; i++) {
      const visitDate = getRandomDate(30);
      const sessionId = uuidv4();

      visits.push({
        ip_address: getRandomIP(),
        country: getRandomItem(sampleCountries),
        city: getRandomItem(sampleCities),
        browser: getRandomItem(sampleBrowsers),
        operating_system:
          Math.random() > 0.5
            ? 'Windows'
            : Math.random() > 0.5
              ? 'macOS'
              : 'Linux',
        device_type: getRandomItem(sampleDevices),
        page_path: getRandomItem(samplePages),
        referrer:
          Math.random() > 0.7
            ? 'https://google.com'
            : Math.random() > 0.5
              ? 'https://twitter.com'
              : null,
        utm_source:
          Math.random() > 0.8
            ? 'google'
            : Math.random() > 0.9
              ? 'twitter'
              : null,
        utm_medium:
          Math.random() > 0.8
            ? 'organic'
            : Math.random() > 0.9
              ? 'social'
              : null,
        session_duration: Math.floor(Math.random() * 600) + 30, // 30-630 seconds
        is_new_visitor: Math.random() > 0.6,
        session_id: sessionId,
        visit_timestamp: visitDate,
      });
    }

    // Insert visits in batches
    const batchSize = 100;
    for (let i = 0; i < visits.length; i += batchSize) {
      const batch = visits.slice(i, i + batchSize);
      await db('site_visits').insert(batch);
      process.stdout.write(
        `\rInserted ${Math.min(i + batchSize, visits.length)}/${visits.length} visits`
      );
    }
    console.log('\n✅ Site visits created!');

    // Generate user actions for existing users
    const users = await db('users').select('id').limit(50);

    if (users.length > 0) {
      console.log('\n🎯 Generating user actions...');
      const actions = [];

      users.forEach(user => {
        // Add some random actions for each user
        const actionsPerUser = Math.floor(Math.random() * 10) + 1;

        for (let i = 0; i < actionsPerUser; i++) {
          const actionDate = getRandomDate(30);
          const actionTypes = [
            'login',
            'logout',
            'view_dashboard',
            'upload_document',
            'connect_account',
          ];

          actions.push({
            user_id: user.id,
            action: getRandomItem(actionTypes),
            metadata: JSON.stringify({
              ip_address: getRandomIP(),
              user_agent: `${getRandomItem(sampleBrowsers)}/${Math.floor(Math.random() * 100)}`,
            }),
            action_timestamp: actionDate,
          });
        }
      });

      await db('user_actions').insert(actions);
      console.log(`✅ Created ${actions.length} user actions!`);
    }

    // Generate some business metrics for the last 30 days
    console.log('\n📈 Generating business metrics...');
    const metrics = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Simulate growing metrics with some randomness
      const baseUsers = 100 + i * 2;
      const dailyGrowth = Math.floor(Math.random() * 10);

      metrics.push({
        metric_date: date.toISOString().split('T')[0],
        period_type: 'daily',
        total_users: baseUsers + dailyGrowth,
        new_users: Math.floor(Math.random() * 5) + 1,
        active_users: Math.floor(
          (baseUsers + dailyGrowth) * (0.7 + Math.random() * 0.2)
        ),
        paid_users: Math.floor((baseUsers + dailyGrowth) * 0.1),
        free_users: Math.floor((baseUsers + dailyGrowth) * 0.9),
        total_visits: Math.floor(Math.random() * 200) + 50,
        unique_visitors: Math.floor(Math.random() * 150) + 30,
        page_views: Math.floor(Math.random() * 500) + 100,
        total_revenue: (Math.random() * 1000).toFixed(2),
        monthly_recurring_revenue: (Math.random() * 5000).toFixed(2),
        geographic_breakdown: JSON.stringify({
          'United States': Math.floor(Math.random() * 50) + 20,
          Canada: Math.floor(Math.random() * 20) + 5,
          'United Kingdom': Math.floor(Math.random() * 15) + 5,
        }),
        device_breakdown: JSON.stringify({
          Desktop: Math.floor(Math.random() * 60) + 40,
          Mobile: Math.floor(Math.random() * 40) + 30,
          Tablet: Math.floor(Math.random() * 20) + 10,
        }),
      });
    }

    // Insert metrics, handling duplicates
    for (const metric of metrics) {
      await db('business_metrics')
        .insert(metric)
        .onConflict(['metric_date', 'period_type'])
        .merge();
    }
    console.log('✅ Business metrics created!');

    console.log('\n🎉 Demo data creation completed!\n');
    console.log('📊 Summary:');
    console.log(`- ${visits.length} site visits`);
    console.log(`- ${users.length * 5} user actions (average)`);
    console.log(`- ${metrics.length} daily business metrics`);
    console.log('\n🚀 You can now view the data in your admin dashboard at:');
    console.log('   http://localhost:3000/admin\n');
  } catch (error) {
    console.error('\n❌ Error creating demo data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
createDemoData();
