package it.smartcommunitylab.ungiorno.model;

import java.util.List;

public class ConsoleWebUser {
    private String username;
    private List<School> authorizedSchools;

    public ConsoleWebUser(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public List<School> getAuthorizedSchools() {
        return authorizedSchools;
    }

    public void setAuthorizedSchools(List<School> schools) {
        this.authorizedSchools = schools;
    }

}
