package it.smartcommunitylab.ungiorno.model;

public class Group extends SchoolObject {
	private String groupId;
	private String name;
	private boolean section;
	
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public boolean isSection() {
		return section;
	}
	public void setSection(boolean section) {
		this.section = section;
	}
	
}
