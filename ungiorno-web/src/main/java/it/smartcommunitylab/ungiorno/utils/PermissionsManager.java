package it.smartcommunitylab.ungiorno.utils;

import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryUser;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.LoginData;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.security.UnGiornoUserDetails;
import it.smartcommunitylab.ungiorno.storage.RepositoryManager;

import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.RememberMeServices;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Component;

import eu.trentorise.smartcampus.aac.AACException;
import eu.trentorise.smartcampus.aac.AACService;
import eu.trentorise.smartcampus.aac.model.TokenData;
import eu.trentorise.smartcampus.profileservice.BasicProfileService;
import eu.trentorise.smartcampus.profileservice.ProfileServiceException;
import eu.trentorise.smartcampus.profileservice.model.AccountProfile;
import eu.trentorise.smartcampus.profileservice.model.BasicProfile;

@Component
public class PermissionsManager {

	@Autowired
	private RepositoryManager storage;

	private AACService service;
	@Autowired
	private Environment env;

	private BasicProfileService profileService;

	@Autowired
	private AuthenticationManager authenticationManager;
	@Autowired
	private RememberMeServices rememberMeServices;

	@PostConstruct
	private void init() {
		service = new AACService(env.getProperty("ext.aacURL"), env.getProperty("ext.clientId"),
				env.getProperty("ext.clientSecret"));
		profileService = new BasicProfileService(env.getProperty("ext.aacURL"));
	}
	public boolean checkKidProfile(String appId, String schoolId, String kidId, Boolean isTeacher) {
		String userId = getUserId();

		KidProfile kid = storage.getKidProfile(appId, schoolId, kidId);

		if (kid != null) {
			if (isTeacher == null || isTeacher) {
				Teacher teacher = storage.getTeacher(userId, appId, schoolId);
				if (teacher != null) {
					if (teacher.getSectionIds().contains(kid.getSection().getSectionId())) {
						return true;
					}
				}
			}
			if (isTeacher == null || !isTeacher) {
				Parent parent = storage.getParent(userId, appId, schoolId);
				if (parent != null) {
					for (AuthPerson person : kid.getPersons()) {
						if (person.getPersonId().equals(parent.getPersonId())) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	public DiaryUser getDiaryUser(String appId, String schoolId, Boolean isTeacher) {
		String userId = getUserId();

		DiaryUser du = new DiaryUser();
		du.setAppId(appId);

		if (isTeacher == null || isTeacher) {
			Teacher teacher = storage.getTeacher(userId, appId, schoolId);
			if (teacher != null) {
				du.setName(teacher.getTeacherName());
				du.setSurname(teacher.getTeacherSurname());
				du.setFullname(teacher.getTeacherFullname());
				du.setTeacher(DiaryUser.DiaryUserTeacher.fromTeacher(teacher));
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, teacher.getTeacherId(), true);
				du.setStudents(kids);
			}
		}
		if (isTeacher == null || !isTeacher) {
			Parent parent = storage.getParent(userId, appId, schoolId);
			if (parent != null) {
				du.setName(parent.getFirstName());
				du.setSurname(parent.getLastName());
				du.setFullname(parent.getFullName());

				du.setParent(DiaryUser.DiaryUserParent.fromParent(parent));
				List<DiaryKidProfile> kids = storage.getDiaryKidProfilesByAuthId(appId, schoolId, parent.getPersonId(), false);
				du.setKids(kids);
			}
		}

		return du;
	}
//
//	public List<String> getIds(DiaryUser du) {
//		List<String> ids = Lists.newArrayList();
//		for (String k : du.getStudents()) {
//			ids.add(k);
//		}
//		for (String k : du.getKids()) {
//			ids.add(k);
//		}
//		return ids;
//	}

	public String getUserId() {
		UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		return principal.getUsername();
	}

	/**
	 * @param du
	 * @param kidId
	 * @param schoolId
	 * @return
	 */
	public boolean hasAccess(DiaryUser du, String kidId, String schoolId) {
		if (du.getStudents() != null) {
			for (DiaryKidProfile p : du.getStudents()) {
				if (p.getKidId().equals(kidId) && p.getSchoolId().equals(schoolId)) {
					return true;
				}
			}
		}
		if (du.getKids() != null) {
			for (DiaryKidProfile p : du.getKids()) {
				if (p.getKidId().equals(kidId) && p.getSchoolId().equals(schoolId)) {
					return true;
				}
			}
		}
		return false;
	}
	
	
	public String getEmail(AccountProfile account) {
		String email = null;
		for (String aName : account.getAccountNames()) {
			for (String key : account.getAccountAttributes(aName).keySet()) {
				if (key.toLowerCase().contains("email")) {
					email = account.getAccountAttributes(aName).get(key);
					if (email != null) break;
				}
			}
			if (email != null) break;
		}
		return email;
	}

	public String getUserAccessToken() throws SecurityException, AACException {
		Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();
		if (credentials instanceof LoginData) {
			TokenData tokenData = ((LoginData)credentials).getTokenData();
			if (!expired(tokenData)) {
				return tokenData.getAccess_token();
			}
		}
		String userId = getUserId();
		
		LoginData data = storage.getTokenData(userId);
		if (data == null) throw new AACException("No user found: "+userId);
		
		if (expired(data.getTokenData())) {
			TokenData newTokenData = service.refreshToken(data.getTokenData().getRefresh_token());
			data.setTokenData(newTokenData);
			storage.saveTokenData(data);
			return newTokenData.getAccess_token();
		}
		return data.getTokenData().getAccess_token();
	}

	/**
	 * @param tokenData
	 * @return
	 */
	private boolean expired(TokenData tokenData) {
		return tokenData.getExpires_on() < System.currentTimeMillis() - TRASHOLD;
	}

	private static final int TRASHOLD = 1000 * 60 * 60;

	/**
	 * @param parameter
	 * @return
	 * @throws AACException 
	 * @throws SecurityException 
	 */
	public TokenData codeToToken(String code) throws SecurityException, AACException {
		return service.exchngeCodeForToken(code, env.getProperty("ext.redirect"));
	}
	public BasicProfileService getProfileService() {
		return profileService;
	}
	public String getLoginURL(String email, String password) {
		return String.format("%s/oauth/token?client_id=%s&client_secret=%s&grant_type=password&username=%s&password=%s", 
				env.getProperty("ext.aacURL"), 
				env.getProperty("ext.clientId"), 
				env.getProperty("ext.clientSecret"),
				email,
				password);
	}
	public String getRegisterURL() {
		return String.format("%s/internal/register/rest?client_id=%s&client_secret=%s", env.getProperty("ext.aacURL"), env.getProperty("ext.clientId"), env.getProperty("ext.clientSecret"));
	}
	public String getAuthorizationURL(String authority){
		if (authority != null) {
			return service.generateAuthorizationURIForCodeFlow(env.getProperty("ext.redirect"), "/"+authority, null, null);
		} else {
			return service.generateAuthorizationURIForCodeFlow(env.getProperty("ext.redirect"), null, null, null);
		}
	}
	
	public String getAppToken() throws AACException {
		return service.generateClientToken().getAccess_token();
	}

	public BasicProfile authenticate(HttpServletRequest request, HttpServletResponse response, TokenData tokenData, boolean rememberMe) throws SecurityException, ProfileServiceException 
	{
		BasicProfile basicProfile = profileService.getBasicProfile(tokenData.getAccess_token());
		AccountProfile accountProfile = profileService.getAccountProfile(tokenData.getAccess_token());
		
		String username = getEmail(accountProfile);
		
		LoginData loginData = new LoginData(username, basicProfile.getUserId(), tokenData);
		
		UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
				username, loginData, UnGiornoUserDetails.UNGIORNO_AUTHORITIES);			
		
		token.setDetails(new WebAuthenticationDetails(request));
		Authentication authenticatedUser = authenticationManager.authenticate(token);
		SecurityContextHolder.getContext().setAuthentication(authenticatedUser);

		if (loginData.getTokenData().getRefresh_token() != null) {
			storage.saveTokenData(loginData);
		}
		
		if (rememberMe) {
			rememberMeServices.loginSuccess(request, response, authenticatedUser);
		}
		return basicProfile;
	}
}
