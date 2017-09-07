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

import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.model.Teacher;
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

	@Test(expected = NullPointerException.class)
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

	@Test(expected = NullPointerException.class)
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

	@Test
	public void test_updateParents() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		List<Parent> parents = new ArrayList<Parent>();
		Parent firstParent = new Parent();
		firstParent.setAppId(appId);
		String firstName = "firstname";
		firstParent.setFirstName(firstName);
		String lastName = "lastname";
		firstParent.setLastName(lastName);
		String fullName = "fullName";
		firstParent.setFullName(fullName);
		String username = "username";
		firstParent.setUsername(username);
		parents.add(firstParent);
		repoManager.updateParents(appId, schoolId, parents);

		Query q = new Query(new Criteria("appId").is(appId));
		q.addCriteria(new Criteria("username").is(username));
		Parent tempParent = mongo.findOne(q, Parent.class);
		Assert.assertEquals(firstName, tempParent.getFirstName());
	}

	@Test
	public void test_updateTeachers() {
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		List<Teacher> teachers = new ArrayList<Teacher>();
		Teacher firstTeacher = new Teacher();
		firstTeacher.setAppId(appId);
		String firstName = "firstname";
		firstTeacher.setTeacherName(firstName);
		String lastName = "lastname";
		firstTeacher.setTeacherSurname(lastName);
		String fullName = "fullName";
		firstTeacher.setTeacherFullname(fullName);
		String username = "username";
		firstTeacher.setUsername(username);
		teachers.add(firstTeacher);
		repoManager.updateTeachers(appId, schoolId, teachers);

		Query q = new Query(new Criteria("appId").is(appId));
		q.addCriteria(new Criteria("username").is(username));
		Teacher tempParent = mongo.findOne(q, Teacher.class);
		Assert.assertEquals(firstName, tempParent.getTeacherName());
	}

	@Test
	public void test_updateDiaryKidPersonsEmptyDiary() {
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
		SectionDef section = new SectionDef();
		String sectionId = "sectionid";
		section.setSectionId(sectionId);
		String title = "title";
		section.setTitle(title);
		firstKid.setSection(section);
		mongo.insert(firstKid);

		Teacher firstTeach = new Teacher();
		firstTeach.setAppId(appId);
		firstTeach.setSchoolId(schoolId);
		List<String> sectionIds = new ArrayList<String>();
		sectionIds.add("sectionid");
		firstTeach.setSectionIds(sectionIds);
		String teacherId = "teacherId";
		firstTeach.setTeacherId(teacherId);
		String username = "username";
		firstTeach.setUsername(username);
		String teacherFullname = "teacherFullname";
		firstTeach.setTeacherFullname(teacherFullname);
		mongo.insert(firstTeach);
		repoManager.updateDiaryKidPersons(appId, schoolId);

		Query q = kidQuery(appId, schoolId, kidId);
		DiaryKid diaryKid = mongo.findOne(q, DiaryKid.class);
		Assert.assertEquals(firstName, diaryKid.getFirstName());
	}

	@Test
	public void test_updateDiaryKidPersonsNonEmptyDiary() {
		this.test_updateDiaryKidPersonsEmptyDiary();
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		String personId = "personid2";
		AuthPerson personFirst = new AuthPerson(personId, "other", true);
		List<AuthPerson> persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		String kidId = "KID1";
		Query q = kidQuery(appId, schoolId, kidId);
		KidProfile kid = mongo.findOne(q, KidProfile.class);
		kid.getPersons().add(personFirst);
		mongo.save(kid);
		repoManager.updateDiaryKidPersons(appId, schoolId);
	}

	@Test
	public void test_getKidProfilesByParent() {
		this.test_updateDiaryKidPersonsEmptyDiary();
		String appId = "TEST";
		String schoolId = "SCHOOL_ID";
		String personId = "personid2";
		AuthPerson personFirst = new AuthPerson(personId, "other", true);
		List<AuthPerson> persons = new ArrayList<AuthPerson>();
		persons.add(personFirst);
		String kidId = "KID1";
		Query q = kidQuery(appId, schoolId, kidId);
		KidProfile kid = mongo.findOne(q, KidProfile.class);
		kid.getPersons().add(personFirst);
		mongo.save(kid);
		repoManager.updateDiaryKidPersons(appId, schoolId);
	}

}
