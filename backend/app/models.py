from . import db




class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    # add password check and hash


class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))



class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(100), nullable=False)
    lastName = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    personalEmail = db.Column(db.String(120))
    gender = db.Column(db.String(50))
    countryOfBirth = db.Column(db.String(100))
    citizenships = db.Column(db.JSON)
    department = db.Column(db.String(100))
    employeeTitle = db.Column(db.String(100))
    departmentAdmin = db.Column(db.String(100))
    departmentAdvisor = db.Column(db.String(100))
    annualSalary = db.Column(db.Float)
    visaType = db.Column(db.String(50))
    status = db.Column(db.String(50))
    filedBy = db.Column(db.String(100))
    caseType = db.Column(db.String(120))
    i94Number = db.Column(db.String(50))
    sevisId = db.Column(db.String(50))
    expirationDate = db.Column(db.Date)
    visaStartDate = db.Column(db.Date)
    initialH1BStartDate = db.Column(db.Date)
    prepExtensionDate = db.Column(db.Date)
    maxHPeriod = db.Column(db.Date)
    i94ExpiryDate = db.Column(db.Date)
    prFilingDate = db.Column(db.Date)
    prStatus = db.Column(db.String(50))
    prNotes = db.Column(db.Text)
    highestEducation = db.Column(db.String(50))
    fieldOfStudy = db.Column(db.String(100))
    socCode = db.Column(db.String(20))
    socCodeDescription = db.Column(db.String(200))
    generalNotes = db.Column(db.Text)
    numberOfDependents = db.Column(db.Integer)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


