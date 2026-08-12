Seed or reset the Skillify database.

## What this does
Runs `server/seed/seed.js` which:
1. Drops all existing data (Users, Courses, Lessons, Quizzes, Enrollments, Progress)
2. Creates test accounts: admin / teacher / student
3. Creates sample courses with lessons, quizzes, and enrollments

## Steps

1. Make sure the server is NOT currently running (to avoid port conflicts with nodemon).

2. Run the seed script:
```bash
cd c:/POC/server && node seed/seed.js
```

3. Report the output to the user. If it succeeds, show the seeded accounts table:

| Role    | Email                    | Password      |
|---------|--------------------------|---------------|
| Admin   | admin@skillify.com      | Admin@123     |
| Teacher | teacher@skillify.com    | Teacher@123   |
| Student | student@skillify.com    | Student@123   |

4. If the seed fails with a connection error:
   - Check that `server/.env` has `MONGO_URI` set to the **standard** (non-SRV) connection string
   - The SRV format (`mongodb+srv://`) is blocked on this network
   - The correct format is: `mongodb://user:pass@host1:27017,host2:27017,host3:27017/skillify?ssl=true&replicaSet=...&authSource=admin`
   - The user can copy the standard connection string from MongoDB Atlas → Connect → Drivers → Standard Connection String

5. If the seed fails with a validation error, read `server/seed/seed.js` and fix the issue before re-running.
