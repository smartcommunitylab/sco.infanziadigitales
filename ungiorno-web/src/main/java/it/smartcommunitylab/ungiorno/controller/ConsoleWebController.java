package it.smartcommunitylab.ungiorno.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.model.AppInfo;
import it.smartcommunitylab.ungiorno.model.Response;
import it.smartcommunitylab.ungiorno.model.School;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.storage.AppSetup;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

/**
 * ConsoleWebController exposes API used to insert data in system from the web insertion console
 * 
 * @author mirko
 *
 */
@RestController
public class ConsoleWebController {

    @Autowired
    private AppSetup appSetup;

    @Autowired
    private RepositoryManager storage;

    @RequestMapping(method = RequestMethod.GET, value = "/consoleweb/{appId}/me")
    public Response<List<School>> getMyData(@PathVariable String appId)
            throws ProfileNotFoundException {

        AppInfo appInfo = appSetup.findAppById(appId);
        return new Response<List<School>>(appInfo.getSchools());
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
