from sqlalchemy import Column, Integer, String, PrimaryKeyConstraint

from .database import Base


class CoursePrerequisite(Base):
    __tablename__ = "course_prerequisite"

    department = Column(String(length=255))
    level = Column(Integer)
    prerequisite = Column(String(length=255))

    __table_args__ = (
        PrimaryKeyConstraint('department', 'level', 'prerequisite'),
    )
