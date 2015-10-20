package it.smartcommunitylab.ungiorno.diary.model;

import it.smartcommunitylab.ungiorno.model.SchoolObject;

import java.util.List;

public class DiaryEntry extends SchoolObject {

	private String kidId;
	private String authorId;
	private String text;
	private List<String> tags;
	private List<String> pictures;
	private long date;
	
	private String entryId;
	
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getAuthorId() {
		return authorId;
	}
	public void setAuthorId(String teacherId) {
		this.authorId = teacherId;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public List<String> getTags() {
		return tags;
	}
	public void setTags(List<String> tags) {
		this.tags = tags;
	}
	public List<String> getPictures() {
		return pictures;
	}
	public void setPictures(List<String> pictures) {
		this.pictures = pictures;
	}
	public long getDate() {
		return date;
	}
	public void setDate(long date) {
		this.date = date;
	}
	public String getEntryId() {
		return entryId;
	}
	public void setEntryId(String entryId) {
		this.entryId = entryId;
	}
	
	
}
