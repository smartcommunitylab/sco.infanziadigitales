package it.smartcommunitylab.ungiorno.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.ConsoleWebUser;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;
import it.smartcommunitylab.ungiorno.utils.JsonUtil;
import it.smartcommunitylab.ungiorno.utils.PermissionsManager;

/**
 * ConsoleWebController exposes API used to insert data in system from the web insertion console
 * 
 * @author mirko
 *
 */
@RestController
public class ConsoleWebController {

    private static final transient Logger logger =
            LoggerFactory.getLogger(ConsoleWebController.class);

    @Autowired
    private AppSetup appSetup;

    @Autowired
    private RepositoryManager storage;

    @Autowired
    private PermissionsManager permissionsManager;

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/me")
    public Response<List<School>> getMyData(@PathVariable String appId)
            throws ProfileNotFoundException {

        AppInfo appInfo = appSetup.findAppById(appId);
        return new Response<List<School>>(appInfo.getSchools());
    }


    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/profile/me")
    public Response<ConsoleWebUser> getMyProfile() {
        // mi serve il token
        logger.info(permissionsManager.getUserId());
        ConsoleWebUser consoleWebUser = new ConsoleWebUser(permissionsManager.getUserId());
        // permissionsManager.getProfileService().getAccountProfile(token);
        return new Response<ConsoleWebUser>(consoleWebUser);
    }



    /*
     * FIXME -> this method clone exactly the ones in SchoolController. Used only because actually
     * console-web is without authentication
     */
    @CrossOrigin
    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/profile")
    public @ResponseBody Response<SchoolProfile> getSchoolProfile(@PathVariable String appId,
            @PathVariable String schoolId) {
        try {
            SchoolProfile profile = storage.getSchoolProfile(appId, schoolId);
            if (logger.isDebugEnabled()) {
                logger.debug("getSchoolProfile:" + appId + " - " + schoolId + " - "
                        + JsonUtil.convertObject(profile));
            }
            return new Response<SchoolProfile>(profile);
        } catch (Exception e) {
            if (logger.isWarnEnabled()) {
                logger.warn("getSchoolProfile:" + appId + " - " + schoolId);
                logger.warn("error", e);
            }
            return new Response<>(e.getMessage());
        }
    }



    @CrossOrigin
    @RequestMapping(method = RequestMethod.PUT, value = "/consoleweb/{appId}/{schoolId}")
    public Response<SchoolProfile> updateSchool(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody SchoolProfile updatedSchoolProfile)
            throws ProfileNotFoundException {
        updatedSchoolProfile.setAppId(appId);
        updatedSchoolProfile.setSchoolId(schoolId);
        storage.storeSchoolProfile(updatedSchoolProfile);
        return new Response<SchoolProfile>(updatedSchoolProfile);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/teacher")
    public Response<List<Teacher>> getTeacherProfiles(@PathVariable String appId,
            @PathVariable String schoolId) {
        List<Teacher> teacherProfiles = storage.getTeachers(appId, schoolId);
        return new Response<>(teacherProfiles);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/{schoolId}/kid")
    public @ResponseBody Response<List<KidProfile>> getKidProfiles(@PathVariable String appId,
            @PathVariable String schoolId) throws ProfileNotFoundException {

        List<KidProfile> profiles = storage.getKidProfilesBySchool(appId, schoolId);
        return new Response<>(profiles);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.POST, value = "/consoleweb/{appId}/{schoolId}/kid")
    public @ResponseBody Response<KidProfile> saveKidProfile(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody KidProfile kid) {
        kid.setAppId(appId);
        kid.setSchoolId(schoolId);
        List<KidProfile> kidProfiles = storage.getKidProfilesBySchool(appId, schoolId);
        KidProfile selectedKidProfile = storage.getKidProfile(appId, schoolId, kid.getKidId());
        if (selectedKidProfile == null) {
            kidProfiles.add(kid);
        } else {
            int profileIndex = kidProfiles.indexOf(selectedKidProfile);
            kidProfiles.remove(profileIndex);
            kidProfiles.add(profileIndex, kid);
        }

        storage.updateChildren(appId, schoolId, kidProfiles);
        return new Response<>(kid);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/kid/{kidId}")
    public Response<KidProfile> removeKidProfile(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String kidId) {
        List<KidProfile> kidProfiles = storage.getKidProfilesBySchool(appId, schoolId);
        KidProfile kidToRemove = storage.getKidProfile(appId, schoolId, kidId);
        kidProfiles.remove(kidToRemove);
        storage.updateChildren(appId, schoolId, kidProfiles);
        return new Response<>(kidToRemove);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.POST, value = "/consoleweb/{appId}/{schoolId}/teacher")
    public Response<Teacher> saveTeacherProfile(@PathVariable String appId,
            @PathVariable String schoolId, @RequestBody Teacher teacher) {
        teacher.setAppId(appId);
        teacher.setSchoolId(schoolId);
        List<Teacher> teacherProfiles = storage.getTeachers(appId, schoolId);
        Teacher selectedTeacherProfile =
                storage.getTeacherByTeacherId(teacher.getTeacherId(), appId, schoolId);
        if (selectedTeacherProfile == null) {
            teacherProfiles.add(teacher);
        } else {
            int profileIndex = teacherProfiles.indexOf(selectedTeacherProfile);
            teacherProfiles.add(profileIndex, teacher);
            teacherProfiles.remove(profileIndex + 1);
        }
        storage.updateTeachers(appId, schoolId, teacherProfiles);
        return new Response<>(teacher);
    }

    @CrossOrigin
    @RequestMapping(method = RequestMethod.DELETE,
            value = "/consoleweb/{appId}/{schoolId}/teacher/{teacherId}")
    public Response<Teacher> removeTeacherProfile(@PathVariable String appId,
            @PathVariable String schoolId, @PathVariable String teacherId) {
        List<Teacher> teacherProfiles = storage.getTeachers(appId, schoolId);
        Teacher teacherToRemove = storage.getTeacherByTeacherId(teacherId, appId, schoolId);
        teacherProfiles.remove(teacherToRemove);
        storage.updateTeachers(appId, schoolId, teacherProfiles);
        return new Response<>(teacherToRemove);
    }



}
