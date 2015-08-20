package it.smartcommunitylab.ungiorno.model;

import java.io.Serializable;
import java.util.List;


public class AppInfo implements Serializable{
	private static final long serialVersionUID = -130084868920590202L;

	private String appId;
    private String password;
    private List<School> schools;

	public String getAppId() {
		return appId;
	}

	public void setAppId(String appId) {
		this.appId = appId;
	}

	public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    @Override
    public String toString() {
    	return appId + "=" + password;
    }

	public List<School> getSchools() {
		return schools;
	}

	public void setSchools(List<School> schools) {
		this.schools = schools;
	}

}
