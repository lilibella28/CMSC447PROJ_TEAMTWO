from . import db




class Admin(db.model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100))
    # add password check and hash


class Test(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))



