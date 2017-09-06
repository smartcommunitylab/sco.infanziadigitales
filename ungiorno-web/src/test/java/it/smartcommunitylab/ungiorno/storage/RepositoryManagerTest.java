package it.smartcommunitylab.ungiorno.storage;

import java.util.ArrayList;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.test.TestConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { TestConfig.class }, loader = AnnotationConfigContextLoader.class)

public class RepositoryManagerTest {

	@Autowired
	private RepositoryManager repoManager;

	@Test
	public void test_getSchoolProfile() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		SchoolProfile school = repoManager.getSchoolProfile(appId, schoolId);
		if (school == null) {
			Assert.assertNull(school);
		} else {
			Assert.assertEquals(appId, school.getAppId());
			Assert.assertEquals(schoolId, school.getSchoolId());
		}
	}

	@Test
	public void test_storeSchoolProfile() {
		SchoolProfile school = new SchoolProfile();
		String appId = "TEST";
		school.setAppId(appId);
		String schoolId = "SCHOOL_ID";
		school.setSchoolId(schoolId);
		repoManager.storeSchoolProfile(school);

		SchoolProfile schoolAfter = repoManager.getSchoolProfile(appId, schoolId);
		Assert.assertEquals(appId, schoolAfter.getAppId());
		Assert.assertEquals(schoolId, schoolAfter.getSchoolId());
	}

	@Test
	public void test_getSchoolProfileForUser() {
		String appId = "TEST";
		String username = "NAME";
		SchoolProfile school = repoManager.getSchoolProfileForUser(appId, username);
		if (school == null) {
			Assert.assertNull(school);
		} else {
			Assert.assertEquals(appId, school.getAppId());
		}
	}

	@Test
	public void test_updateAuthorizationsCaseEmptyPersons() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		SchoolProfile school = new SchoolProfile();
		school.setAppId(appId);
		school.setSchoolId(schoolId);
		repoManager.storeSchoolProfile(school);
		KidProfile firstKid = new KidProfile();
		String kidId = "KID1";
		firstKid.setKidId(kidId);
		String fullName = "NAME1";
		firstKid.setFullName(fullName);
		String lastName = "LNAME1Other";
		firstKid.setLastName(lastName);
		String firstName = "FNAME1Other";
		firstKid.setFirstName(firstName);
		firstKid.setAppId(appId);
		firstKid.setSchoolId(schoolId);

		String personId = "personid1";
		AuthPerson personFirst = new AuthPerson(personId, "parent", true);
		// personFirst.setPersonId(personId);
		List<AuthPerson> persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		firstKid.setPersons(persons);
		System.out.println(firstKid.getPersons());
		System.out.println(firstKid.getFirstName());
		List<KidProfile> children = new ArrayList<KidProfile>();
		children.add(firstKid);
		// it will throw error in case there is no authorized person
		// because old.getPersons() is null
		repoManager.updateAuthorizations(appId, schoolId, children);
	}
}
