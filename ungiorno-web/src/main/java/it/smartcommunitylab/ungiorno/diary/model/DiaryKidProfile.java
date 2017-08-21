package it.smartcommunitylab.ungiorno.diary.model;

import it.smartcommunitylab.ungiorno.model.SchoolObject;

import java.util.List;

public class DiaryKidProfile extends SchoolObject{

	private String kidId;
	private List<String> authorizedPersonsIds;

	public String getKidId() {
		return kidId;
	}

	public void setKidId(String kidId) {
		this.kidId = kidId;
	}

	public List<String> getAuthorizedPersonsIds() {
		return authorizedPersonsIds;
	}

	public void setAuthorizedPersonsIds(List<String> authorizedPersonsIds) {
		this.authorizedPersonsIds = authorizedPersonsIds;
	}
	
	
	
}
