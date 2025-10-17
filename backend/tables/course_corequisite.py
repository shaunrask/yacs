from sqlalchemy import Column, String, Integer, PrimaryKeyConstraint
from ..database import Base  # adjusted import to go up one level

class CourseCorequisite(Base):
    __tablename__ = 'course_corequisite'

    department = Column(String(255))
    level = Column(Integer)
    corequisite = Column(String(255))

    __table_args__ = (
        PrimaryKeyConstraint('department', 'level', 'corequisite'),
    )
