# Quick smoke test for CoursePrerequisite model
# Usage: python backend/tests/test_course_prerequisite.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import Base and model
from backend.tables.database import Base
from backend.tables.course_prerequisite import CoursePrerequisite

# Use an in-memory SQLite engine for safe local testing
engine = create_engine('sqlite:///:memory:')
Session = sessionmaker(bind=engine)

def main():
    # Create tables
    Base.metadata.create_all(engine)

    # Create a session and insert a sample row
    session = Session()
    cp = CoursePrerequisite(department='MATH', level=101, prerequisite='MATH 100')
    session.add(cp)
    session.commit()

    # Query it back
    result = session.query(CoursePrerequisite).first()
    print('Inserted row:', result.department, result.level, result.prerequisite)

    # Clean up
    session.close()

if __name__ == '__main__':
    main()
