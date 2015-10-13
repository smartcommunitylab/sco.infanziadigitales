package it.smartcommunitylab.ungiorno.diary.model;

import java.util.List;

import com.google.common.collect.Lists;

public class DiaryUser {

	private String parentId;
	private String teacherId;
	
	private List<DiaryKidProfile> sons;
	private List<DiaryKidProfile> students;
	
	
	public DiaryUser() {
		sons = Lists.newArrayList();
		students = Lists.newArrayList();
	}
	
	public String getParentId() {
		return parentId;
	}
	public void setParentId(String parentId) {
		this.parentId = parentId;
	}
	public String getTeacherId() {
		return teacherId;
	}
	public void setTeacherId(String teacherId) {
		this.teacherId = teacherId;
	}
	public List<DiaryKidProfile> getSons() {
		return sons;
	}
	public void setSons(List<DiaryKidProfile> sons) {
		this.sons = sons;
	}
	public List<DiaryKidProfile> getStudents() {
		return students;
	}
	public void setStudents(List<DiaryKidProfile> students) {
		this.students = students;
	}
	
	
}
