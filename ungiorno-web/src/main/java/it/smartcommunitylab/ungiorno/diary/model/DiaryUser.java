package it.smartcommunitylab.ungiorno.diary.model;

import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Teacher;

import java.util.List;

import com.google.common.collect.Lists;

public class DiaryUser {

	private List<DiaryKidProfile> kids;
	private List<DiaryKidProfile> students;
	
	private DiaryUserParent parent;
	private DiaryUserTeacher teacher;
	
	private String appId, name, surname, fullname;
	
	public DiaryUser() {
		kids = Lists.newArrayList();
		students = Lists.newArrayList();
	}

	public String getAppId() {
		return appId;
	}
	public void setAppId(String appId) {
		this.appId = appId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getSurname() {
		return surname;
	}
	public void setSurname(String surname) {
		this.surname = surname;
	}
	public String getFullname() {
		if (fullname == null) {
			fullname = name + " " + surname;
		}
		return fullname;
	}
	public void setFullname(String fullName) {
		this.fullname = fullName;
	}

	public List<DiaryKidProfile> getKids() {
		return kids;
	}

	public void setKids(List<DiaryKidProfile> kids) {
		this.kids = kids;
	}

	public List<DiaryKidProfile> getStudents() {
		return students;
	}

	public void setStudents(List<DiaryKidProfile> students) {
		this.students = students;
	}

	public DiaryUserParent getParent() {
		return parent;
	}

	public void setParent(DiaryUserParent parent) {
		this.parent = parent;
	}

	public DiaryUserTeacher getTeacher() {
		return teacher;
	}

	public void setTeacher(DiaryUserTeacher teacher) {
		this.teacher = teacher;
	}




	public static class DiaryUserParent {
		private String userId;

		public String getUserId() {
			return userId;
		}

		public void setUserId(String userId) {
			this.userId = userId;
		}

		/**
		 * @param parent
		 * @return
		 */
		public static DiaryUserParent fromParent(Parent parent) {
			DiaryUserParent p = new DiaryUserParent();
			p.setUserId(parent.getPersonId());
			return p;
		}
	}

	public static class DiaryUserTeacher {
		private String userId, schoolId;
		private List<String> sectionIds;
		public String getUserId() {
			return userId;
		}
		public void setUserId(String userId) {
			this.userId = userId;
		}
		public String getSchoolId() {
			return schoolId;
		}
		public void setSchoolId(String schoolId) {
			this.schoolId = schoolId;
		}
		public List<String> getSectionIds() {
			return sectionIds;
		}
		public void setSectionIds(List<String> sectionIds) {
			this.sectionIds = sectionIds;
		}
		/**
		 * @param teacher
		 * @return
		 */
		public static DiaryUserTeacher fromTeacher(Teacher teacher) {
			DiaryUserTeacher t = new DiaryUserTeacher();
			t.setSchoolId(teacher.getSchoolId());
			t.setUserId(teacher.getTeacherId());
			t.setSectionIds(teacher.getSectionIds());
			return t;
		}


	}

}
