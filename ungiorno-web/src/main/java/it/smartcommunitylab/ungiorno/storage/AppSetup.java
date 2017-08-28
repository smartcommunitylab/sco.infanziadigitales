package it.smartcommunitylab.ungiorno.storage;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;

@Component
public class AppSetup {

    @Value("classpath:/apps-info.yml")
    private Resource resource;

    @Autowired
    private RepositoryManager storage;


    @PostConstruct
    public void init() throws IOException {
        Yaml yaml = new Yaml(new Constructor(AppSetup.class));
        AppSetup data = (AppSetup) yaml.load(resource.getInputStream());
        this.apps = data.apps;
        this.uploadDirectory = data.uploadDirectory;

        for (AppInfo cred : data.getApps()) {
            storage.createApp(cred);

            // create schoolProfile bound to appId
            for (School school : cred.getSchools()) {
                SchoolProfile schoolProfile = new SchoolProfile();
                schoolProfile.setSchoolId(school.getSchoolId());
                schoolProfile.setAppId(cred.getAppId());
                if (storage.getSchoolProfile(cred.getAppId(), school.getSchoolId()) == null) {
                    storage.storeSchoolProfile(schoolProfile);
                }
            }
        }

        if (appsMap == null) {
            appsMap = new HashMap<String, AppInfo>();
            for (AppInfo app : apps) {
                appsMap.put(app.getAppId(), app);
            }
        }
    }


    private String uploadDirectory;
    private List<AppInfo> apps;
    private Map<String, AppInfo> appsMap;

    public String getUploadDirectory() {
        return uploadDirectory;
    }

    public void setUploadDirectory(String uploadDirectory) {
        this.uploadDirectory = uploadDirectory;
    }

    public List<AppInfo> getApps() {
        return apps;
    }

    public void setApps(List<AppInfo> apps) {
        this.apps = apps;
    }

    public Map<String, AppInfo> getAppsMap() {
        return appsMap;
    }

    public void setAppsMap(Map<String, AppInfo> appsMap) {
        this.appsMap = appsMap;
    }

    @Override
    public String toString() {
        return "AppSetup [apps=" + apps + "]";
    }

    public AppInfo findAppById(String username) {
        return appsMap.get(username);
    }
}
