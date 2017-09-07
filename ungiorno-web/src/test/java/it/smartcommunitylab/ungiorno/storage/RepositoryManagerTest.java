package it.smartcommunitylab.ungiorno.storage;

import java.util.ArrayList;
import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.test.TestConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { TestConfig.class }, loader = AnnotationConfigContextLoader.class)

public class RepositoryManagerTest {

	@Autowired
	private RepositoryManager repoManager;

	@Autowired
	private MongoTemplate mongo;

	@Before
	public void clean() {
		mongo.getDb().dropDatabase();
	}

	@Test
	public void test_getSchoolProfileNotExisting() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		SchoolProfile school = repoManager.getSchoolProfile(appId, schoolId);
		Assert.assertNull(school);
	}

	@Test
	public void test_getSchoolProfileExist() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		SchoolProfile school = new SchoolProfile();
		school.setSchoolId(schoolId);
		school.setAppId(appId);
		repoManager.storeSchoolProfile(school);
		school = repoManager.getSchoolProfile(appId, schoolId);

		Assert.assertEquals(appId, school.getAppId());
		Assert.assertEquals(schoolId, school.getSchoolId());

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
		Assert.assertNull(school);
	}

	@Test
	public void test_updateAuthorizationsNonExistingKid() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		KidProfile firstKid = new KidProfile();
		String kidId = "KID1";
		firstKid.setKidId(kidId);
		String fullName = "NAME1";
		firstKid.setFullName(fullName);
		String lastName = "LNAME1";
		firstKid.setLastName(lastName);
		String firstName = "FNAME1";
		firstKid.setFirstName(firstName);
		firstKid.setAppId(appId);
		firstKid.setSchoolId(schoolId);

		String personId = "personid1";
		AuthPerson personFirst = new AuthPerson(personId, "parent", true);
		List<AuthPerson> persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		// firstKid.setPersons(persons);
		System.out.println(firstKid.getPersons());
		System.out.println(firstKid.getFirstName());
		List<KidProfile> children = new ArrayList<KidProfile>();
		children.add(firstKid);
		repoManager.updateAuthorizations(appId, schoolId, children);

		KidProfile newInserted = mongo.findOne(kidQuery(appId, schoolId, firstKid.getKidId()), KidProfile.class);
		Assert.assertEquals(appId, newInserted.getAppId());
		Assert.assertEquals(schoolId, newInserted.getSchoolId());
		Assert.assertEquals(kidId, newInserted.getKidId());
	}

	private Query kidQuery(String appId, String schoolId, String kidId) {
		return new Query(new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId").is(kidId));
	}

	@Test
	public void test_updateAuthorizationsExistingKid() {
		this.test_updateAuthorizationsNonExistingKid();
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		KidProfile firstKid = new KidProfile();
		String kidId = "KID1";
		firstKid.setKidId(kidId);
		String fullName = "NAME_NEW";
		firstKid.setFullName(fullName);
		String lastName = "LNAME_NEW";
		firstKid.setLastName(lastName);
		String firstName = "FNAME_NEW";
		firstKid.setFirstName(firstName);
		firstKid.setAppId(appId);
		firstKid.setSchoolId(schoolId);

		String personId = "personid1";
		AuthPerson personFirst = new AuthPerson(personId, "parent", true);
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

		KidProfile newInserted = mongo.findOne(kidQuery(appId, schoolId, firstKid.getKidId()), KidProfile.class);
		Assert.assertEquals(persons, newInserted.getPersons());
	}

	@Test
	public void test_updateChildrenNonExistingDiaryAndTeacher() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		KidProfile firstKid = new KidProfile();
		String kidId = "KID1";
		firstKid.setKidId(kidId);
		String fullName = "NAME";
		firstKid.setFullName(fullName);
		String lastName = "LNAME";
		firstKid.setLastName(lastName);
		String firstName = "FNAME";
		firstKid.setFirstName(firstName);
		firstKid.setAppId(appId);
		firstKid.setSchoolId(schoolId);

		String personId = "personid1";
		AuthPerson personFirst = new AuthPerson(personId, "parent", true);
		List<AuthPerson> persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		firstKid.setPersons(persons);
		DiaryTeacher teacherFirst = new DiaryTeacher();
		String teacherId = "TEACHER1";
		teacherFirst.setTeacherId(teacherId);
		teacherFirst.setPrimary(true);
		List<DiaryTeacher> teachers = new ArrayList<DiaryTeacher>();
		teachers.add(teacherFirst);
		firstKid.setDiaryTeachers(teachers);
		List<KidProfile> children = new ArrayList<KidProfile>();
		children.add(firstKid);
		repoManager.updateChildren(appId, schoolId, children);
	}

	@Test
	public void test_updateChildrenExistDiary() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		KidProfile firstKid = new KidProfile();
		String kidId = "KID1";
		firstKid.setKidId(kidId);
		String fullName = "NAME";
		firstKid.setFullName(fullName);
		String lastName = "LNAME";
		firstKid.setLastName(lastName);
		String firstName = "FNAME";
		firstKid.setFirstName(firstName);
		firstKid.setAppId(appId);
		firstKid.setSchoolId(schoolId);

		String personId = "personid1";
		AuthPerson personFirst = new AuthPerson(personId, "parent", true);
		List<AuthPerson> persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		firstKid.setPersons(persons);
		List<KidProfile> children = new ArrayList<KidProfile>();
		children.add(firstKid);
		repoManager.updateChildren(appId, schoolId, children);

		fullName = "NAME_NEW";
		firstKid.setFullName(fullName);
		personId = "personid11111";
		personFirst = new AuthPerson(personId, "test", true);
		persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		firstKid.setPersons(persons);
		children = new ArrayList<KidProfile>();
		children.add(firstKid);
		repoManager.updateChildren(appId, schoolId, children);

		// KidProfile newInserted = mongo.findOne(kidQuery(appId, schoolId,
		// firstKid.getKidId()), KidProfile.class);
		// Assert.assertEquals(appId, newInserted.getAppId());
		// Assert.assertEquals(schoolId, newInserted.getSchoolId());
		// Assert.assertEquals(kidId, newInserted.getKidId());

	}
}
