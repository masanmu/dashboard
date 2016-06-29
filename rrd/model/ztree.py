#-*- coding:utf-8 -*-
from rrd.store import graph_db_conn as db_conn

class Ztree(object):
    def __init__(self,id,pid,name,isparent):
        self.id = str(id)
        self.pid = str(pid)
        self.name = name
        self.isparent = isparent
    def __repr__(self):
        return "<ztree id:%s,pid:%s>" % (self.id,self.pid)
    __str__ = __repr__

    @classmethod
    def gets(cls):
        sql = '''select id,pid,name,isparent from ztree order by name'''
        cursor = db_conn.execute(sql)
        rows = cursor.fetchall()
        cursor and cursor.close()
        return [cls(*row) for row in rows]
    @classmethod
    def get_name_by_id(cls,id):
	grp_id = str(id[0:2])
	idc_id = str(grp_id+id[2:4])
	args = [grp_id,idc_id,id]
	sql = '''select id,pid,name,isparent from ztree where id = %s or id = %s or id =%s order by id DESC'''
	cursor = db_conn.execute(sql,args)
	rows = cursor.fetchall()
	cursor and cursor.close()
	return [cls(*row) for row in rows]
