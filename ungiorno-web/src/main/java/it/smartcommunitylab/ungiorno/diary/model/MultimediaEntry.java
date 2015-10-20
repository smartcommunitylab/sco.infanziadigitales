package it.smartcommunitylab.ungiorno.diary.model;

import it.smartcommunitylab.ungiorno.model.SchoolObject;

public class MultimediaEntry extends SchoolObject{

	private String kidId;
	private String multimediaId;
	
	public String getKidId() {
		return kidId;
	}
	public void setKidId(String kidId) {
		this.kidId = kidId;
	}
	public String getMultimediaId() {
		return multimediaId;
	}
	public void setMultimediaId(String imageId) {
		this.multimediaId = imageId;
	}
	
	
	
}
