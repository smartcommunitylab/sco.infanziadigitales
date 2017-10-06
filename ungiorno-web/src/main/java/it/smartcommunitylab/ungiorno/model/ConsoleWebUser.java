package it.smartcommunitylab.ungiorno.model;

import java.util.List;

public class ConsoleWebUser {
    private String username;
    private List<School> schoolAuthorized;

    public ConsoleWebUser(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public List<School> getSchoolAuthorized() {
        return schoolAuthorized;
    }

    public void setSchoolAuthorized(List<School> schoolAuthorized) {
        this.schoolAuthorized = schoolAuthorized;
    }


}
