package it.smartcommunitylab.ungiorno.storage;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.Contact;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.services.RepositoryService;

@Component
public class AppSetup {

    private static final Logger logger = LoggerFactory.getLogger(AppSetup.class);

    @Value("classpath:/apps-info.yml")
    private Resource resource;

    @Autowired
    private RepositoryService storage;

    private String uploadDirectory;
    private List<AppInfo> apps;
    private Map<String, AppInfo> appsMap;

    private Map<String, List<School>> schoolsByAccount = new HashMap<>();


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
                schoolProfile.setName(school.getName());
                schoolProfile.setAddress(school.getAddress());
                schoolProfile.setAccessEmail(school.getAccessEmail());
                if (CollectionUtils.isNotEmpty(school.getAccounts())) {
                    Contact schoolContact = new Contact();
                    schoolContact
                            .setEmail(new ArrayList<>(Arrays.asList(school.getAccounts().get(0))));
                    schoolProfile.setContacts(schoolContact);
                }
                if (storage.getSchoolProfile(cred.getAppId(), school.getSchoolId()) == null) {
                    logger.info("Creating schoolProfile, appId: {}, schoolId: {}", cred.getAppId(),
                            school.getSchoolId());
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

    public List<School> findSchoolsByAccount(String account) {
        if (account == null) {
            return new ArrayList<>();
        }
        List<School> schools = schoolsByAccount.get(account);
        if (schools == null) {
            schools = new ArrayList<>();
            for (AppInfo app : apps) {
                for (School school : app.getSchools()) {
                    if (school.getAccounts() != null && school.getAccounts().contains(account)) {
                        school.setAppId(app.getAppId());
                        schools.add(school);
                    }
                }
            }
            schoolsByAccount.put(account, schools);
        }

        return schools;
    }
}
