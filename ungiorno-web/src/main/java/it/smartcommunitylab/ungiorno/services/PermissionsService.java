package it.smartcommunitylab.ungiorno.services;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.aac.model.TokenData;
import eu.trentorise.smartcampus.profileservice.BasicProfileService;
import eu.trentorise.smartcampus.profileservice.ProfileServiceException;
import eu.trentorise.smartcampus.profileservice.model.AccountProfile;
import eu.trentorise.smartcampus.profileservice.model.BasicProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;


public interface PermissionsService {

    boolean checkKidProfile(String appId, String schoolId, String kidId, Boolean isTeacher);

    DiaryUser getDiaryUser(String appId, String schoolId, Boolean isTeacher);

    String getUserId();

    boolean isSchoolTeacher(String appId, String schoolId, String username);

    /**
     * @param du
     * @param kidId
     * @param schoolId
     * @return
     */
    boolean hasAccess(DiaryUser du, String kidId, String schoolId);

    String getEmail(AccountProfile account);

    String getUserAccessToken() throws SecurityException, AACException;

    /**
     * @param parameter
     * @return
     * @throws AACException 
     * @throws SecurityException 
     */
    TokenData codeToToken(String code) throws SecurityException, AACException;

    BasicProfileService getProfileService();

    String getLoginURL(String email, String password);

    String getRegisterURL();

    String getAuthorizationURL(String authority);

    String getAppToken() throws AACException;

    BasicProfile authenticate(HttpServletRequest request, HttpServletResponse response,
            TokenData tokenData, boolean rememberMe)
            throws SecurityException, ProfileServiceException;

}
