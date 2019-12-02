/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
package it.smartcommunitylab.ungiorno.model;

import java.io.Serializable;
import java.util.List;

/**
 * School contains configuration informations from YAML apps-info file
 * 
 * @author raman
 *
 */
public class School implements Serializable {

    private static final long serialVersionUID = -2439551592309461718L;

    private String appId;
    private String schoolId;
    private String name;
    private String address;
    private List<String> accounts;
    private String accessEmail;
    private List<String> tags;

    private Boolean disabled;
    
    public String getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(String schoolId) {
        this.schoolId = schoolId;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<String> getAccounts() {
        return accounts;
    }

    public void setAccounts(List<String> accounts) {
        this.accounts = accounts;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getAccessEmail() {
        return accessEmail;
    }

    public void setAccessEmail(String accessEmail) {
        this.accessEmail = accessEmail;
    }

	public Boolean getDisabled() {
		return disabled;
	}

	public void setDisabled(Boolean disabled) {
		this.disabled = disabled;
	}
}
