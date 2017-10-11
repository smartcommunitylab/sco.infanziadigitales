package it.smartcommunitylab.ungiorno.storage;

import static org.hamcrest.Matchers.hasSize;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.hamcrest.Matchers;
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

import it.smartcommunitylab.ungiorno.config.exception.ProfileNotFoundException;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKid.DiaryKidPerson;
import it.smartcommunitylab.ungiorno.diary.model.DiaryKidProfile;
import it.smartcommunitylab.ungiorno.diary.model.DiaryTeacher;
import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.CalendarItem;
import it.smartcommunitylab.ungiorno.model.KidCalAssenza;
import it.smartcommunitylab.ungiorno.model.KidCalFermata;
import it.smartcommunitylab.ungiorno.model.KidCalRitiro;
import it.smartcommunitylab.ungiorno.model.KidConfig;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.Parent;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.model.SectionDef;
import it.smartcommunitylab.ungiorno.model.Teacher;
import it.smartcommunitylab.ungiorno.model.TimeSlotSchoolService;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.test.TestConfig;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestConfig.class}, loader = AnnotationConfigContextLoader.class)
public class RepositoryManagerTest {

    @Autowired
    private RepositoryService repoManager;

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
    public void test_storeProfileWithoutRegularService() {
        SchoolProfile school = new SchoolProfile();
        String appId = "TEST";
        school.setAppId(appId);
        String schoolId = "SCHOOL_ID";
        school.setSchoolId(schoolId);

        Assert.assertTrue(school.getServices().isEmpty());
        repoManager.storeSchoolProfile(school);

        school = repoManager.getSchoolProfile(appId, schoolId);
        Assert.assertThat(school.getServices(), Matchers.hasItem(new TimeSlotSchoolService(
                TimeSlotSchoolService.DEFAULT_REGULAR_SERVICE_NAME, true)));
    }


    @Test
    public void test_storeProfileContainingRegularService() {
        SchoolProfile school = new SchoolProfile();
        String appId = "TEST";
        school.setAppId(appId);
        String schoolId = "SCHOOL_ID";
        school.setSchoolId(schoolId);
        school.getServices().add(new TimeSlotSchoolService(
                TimeSlotSchoolService.DEFAULT_REGULAR_SERVICE_NAME, true));

        Assert.assertThat(school.getServices(), hasSize(1));
        repoManager.storeSchoolProfile(school);
        school = repoManager.getSchoolProfile(appId, schoolId);
        Assert.assertThat(school.getServices(), hasSize(1));
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

        KidProfile newInserted =
                mongo.findOne(kidQuery(appId, schoolId, firstKid.getKidId()), KidProfile.class);
        Assert.assertEquals(appId, newInserted.getAppId());
        Assert.assertEquals(schoolId, newInserted.getSchoolId());
        Assert.assertEquals(kidId, newInserted.getKidId());
    }

    private Query kidQuery(String appId, String schoolId, String kidId) {
        return new Query(new Criteria("appId").is(appId).and("schoolId").is(schoolId).and("kidId")
                .is(kidId));
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

        KidProfile newInserted =
                mongo.findOne(kidQuery(appId, schoolId, firstKid.getKidId()), KidProfile.class);
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
    public void test_getCalendar() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";
        String kidId = "KID1";

        List<CalendarItem> result =
                repoManager.getCalendar(appId, schoolId, kidId, 1443528909, 1443528909);
        Assert.assertEquals("Gita sul pasubio", result.get(0).getTitle());
    }

    @Test
    public void test_saveConfig() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";
        String kidId = "KID1";
        KidConfig kidc = new KidConfig();
        kidc.setAppId(appId);
        kidc.setSchoolId(schoolId);
        kidc.setKidId(kidId);
        String _id = "_id";
        kidc.set_id(_id);
        mongo.save(kidc);
        KidConfig kidToBeUpdated = new KidConfig();
        kidToBeUpdated.setKidId(kidId);
        kidToBeUpdated.setAppId(appId);
        kidToBeUpdated.setSchoolId(schoolId);

        KidConfig result = repoManager.saveConfig(kidToBeUpdated);
        Assert.assertEquals(_id, result.get_id());
    }

    @Test(expected = ProfileNotFoundException.class)
    public void test_getKidProfilesByParentNonExistingParent() throws ProfileNotFoundException {
        String appId = "TEST";
        String username = "USERNAME";

        repoManager.getKidProfilesByParent(appId, username);
    }

    @Test
    public void test_getKidProfilesByParent() throws ProfileNotFoundException {
        String appId = "TEST";
        String username = "USERNAME";
        Parent p = new Parent();
        String personId = "personid";
        p.setPersonId(personId);
        p.setUsername(username);
        p.setAppId(appId);
        mongo.save(p);// create parent

        KidProfile kidp = new KidProfile();
        kidp.setAppId(appId);
        AuthPerson person = new AuthPerson();
        person.setParent(true);
        String personId2 = "personid";
        person.setPersonId(personId2);
        List<AuthPerson> persons = new ArrayList<>();
        persons.add(person);
        kidp.setPersons(persons);
        mongo.save(kidp);// create kid profile

        List<KidProfile> r = repoManager.getKidProfilesByParent(appId, username);
        Assert.assertEquals(personId2, r.get(0).getPersons().get(0).getPersonId());
    }

    @Test
    public void test_getKidProfilesBySchool() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";

        KidProfile kidp = new KidProfile();
        kidp.setAppId(appId);
        kidp.setSchoolId(schoolId);
        String kidId = "kidid";
        kidp.setKidId(kidId);
        String firstName = "firstName";
        kidp.setFirstName(firstName);
        mongo.save(kidp);// create kid profile

        List<KidProfile> r = repoManager.getKidProfilesBySchool(appId, schoolId);
        Assert.assertEquals(firstName, r.get(0).getFirstName());
    }

    @Test(expected = IndexOutOfBoundsException.class)
    public void test_getKidProfilesByTeacher() {
        String appId = "TEST";
        String username = "USERNAME";
        Teacher t = new Teacher();
        t.setAppId(appId);
        t.setUsername(username);
        String teacherId = "teacherId";
        t.setTeacherId(teacherId);
        mongo.save(t);

        KidProfile kidp = new KidProfile();
        kidp.setAppId(appId);
        String kidId = "kidid";
        kidp.setKidId(kidId);
        String firstName = "firstName";
        kidp.setFirstName(firstName);
        DiaryTeacher diaryTeacher = new DiaryTeacher();
        diaryTeacher.setTeacherId(teacherId);
        List<DiaryTeacher> diaryTeachers = new ArrayList<>();
        diaryTeachers.add(diaryTeacher);
        kidp.setDiaryTeachers(diaryTeachers);
        mongo.save(kidp);// create kid profile

        List<KidProfile> r = repoManager.getKidProfilesByTeacher(appId, username);
        // it will return empty array since there is no teacherId in KidProfile Class
        // q.addCriteria(new Criteria("teacherId").is(p.getTeacherId()));
        // instead we have to check for the list of teachers

        Assert.assertEquals(teacherId, r.get(0).getDiaryTeachers().get(0).getTeacherId());
    }

    @Test
    public void test_getDiaryKidProfilesByAuthId() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";
        String authId = "authId";
        boolean isTeacher = false;

        DiaryKid dkid = new DiaryKid();
        dkid.setAppId(appId);
        dkid.setSchoolId(schoolId);
        String kidid = "kidId";
        dkid.setKidId(kidid);
        List<DiaryKidPerson> dkpAll = new ArrayList<>();
        DiaryKidPerson dkp = new DiaryKidPerson();
        String firstName = "firstName";
        dkp.setFirstName(firstName);
        String personId = authId;
        dkp.setPersonId(personId);
        dkp.setParent(true);
        dkp.setAuthorized(true);
        dkpAll.add(dkp);
        dkid.setPersons(dkpAll);

        mongo.save(dkid);// create kid profile

        List<DiaryKidProfile> r =
                repoManager.getDiaryKidProfilesByAuthId(appId, schoolId, authId, isTeacher);
        System.out.println(r);
        Assert.assertEquals(kidid, r.get(0).getKidId());
    }

    private long timestampToDate(long timestamp) {
        timestamp = timestamp == 0 ? System.currentTimeMillis() : timestamp;
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(timestamp);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    private Date timestampToDate2(long timestamp) {
        timestamp = timestamp == 0 ? System.currentTimeMillis() : timestamp;
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(timestamp);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTime();
    }

    @Test
    public void test_saveStop() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";
        KidCalFermata stop = new KidCalFermata();
        stop.setAppId(appId);
        stop.setSchoolId(schoolId);
        String kidId = "kidId";
        stop.setKidId(kidId);
        Date date = new Date();
        long temp = timestampToDate(date.getTime());
        stop.setDate(temp);
        mongo.save(stop);

        KidConfig kConfig = new KidConfig();
        kConfig.setAppId(appId);
        kConfig.setSchoolId(schoolId);
        kConfig.setKidId(kidId);
        mongo.save(kConfig);

        KidCalRitiro kalRitiro = new KidCalRitiro();
        kalRitiro.setAppId(appId);
        kalRitiro.setSchoolId(schoolId);
        kalRitiro.setKidId(kidId);
        kalRitiro.setDate(temp);
        mongo.save(kalRitiro);

        KidCalAssenza kalAssenza = new KidCalAssenza();
        kalAssenza.setAppId(appId);
        kalAssenza.setSchoolId(schoolId);
        kalAssenza.setKidId(kidId);
        kalAssenza.setDateFrom(temp);
        mongo.save(kalAssenza);

        repoManager.saveStop(stop);
        Query q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
        q.addCriteria(new Criteria("dateFrom").is(stop.getDate()));
        List<KidCalAssenza> kidCalAss = mongo.find(q, KidCalAssenza.class);
        Assert.assertEquals(0, kidCalAss.size());
    }

    @Test
    public void test_saveAbsence() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";
        String kidId = "kidId";
        Date date = new Date();
        long temp = timestampToDate(date.getTime());
        long tempTo = date.getTime() + 1 * 24 * 60 * 60 * 1000;
        System.out.println(timestampToDate2(tempTo));

        KidCalAssenza kalAssenza = new KidCalAssenza();
        kalAssenza.setAppId(appId);
        kalAssenza.setSchoolId(schoolId);
        kalAssenza.setKidId(kidId);
        kalAssenza.setDateFrom(temp);
        kalAssenza.setDateTo(tempTo);
        mongo.save(kalAssenza);

        KidCalFermata stop = new KidCalFermata();
        stop.setAppId(appId);
        stop.setSchoolId(schoolId);
        stop.setKidId(kidId);
        stop.setDate(temp);
        mongo.save(stop);

        KidCalRitiro kalRitiro = new KidCalRitiro();
        kalRitiro.setAppId(appId);
        kalRitiro.setSchoolId(schoolId);
        kalRitiro.setKidId(kidId);
        kalRitiro.setDate(temp);
        mongo.save(kalRitiro);

        repoManager.saveAbsence(kalAssenza);
        Query q = kidQuery(stop.getAppId(), stop.getSchoolId(), stop.getKidId());
        q.addCriteria(new Criteria("date").is(stop.getDate()));
        List<KidCalFermata> kidCalFer = mongo.find(q, KidCalFermata.class);
        List<KidCalRitiro> kidCalRit = mongo.find(q, KidCalRitiro.class);

        q = kidQuery(kalAssenza.getAppId(), kalAssenza.getSchoolId(), kalAssenza.getKidId());
        q.addCriteria(
                new Criteria().andOperator(new Criteria("dateFrom").gte(kalAssenza.getDateFrom())));
        List<KidCalAssenza> kidCalAssenza = mongo.find(q, KidCalAssenza.class);

        Assert.assertEquals(0, kidCalFer.size());
        Assert.assertEquals(0, kidCalRit.size());
        Assert.assertEquals(2, kidCalAssenza.size());
    }

    @Test
    public void test_saveReturn() {
        String appId = "TEST";
        String schoolId = "SCHOOL_ID";
        String kidId = "kidId";
        Date date = new Date();
        long temp = timestampToDate(date.getTime());

        KidCalRitiro kalRitiro = new KidCalRitiro();
        kalRitiro.setAppId(appId);
        kalRitiro.setSchoolId(schoolId);
        kalRitiro.setKidId(kidId);
        kalRitiro.setDate(temp);
        kalRitiro.setNote("TEST_NOTE");
        mongo.save(kalRitiro);

        repoManager.saveReturn(kalRitiro);
        Query q = kidQuery(appId, schoolId, kidId);
        q.addCriteria(new Criteria().andOperator(new Criteria("date").gte(temp),
                new Criteria("date").lt(temp + 1000 * 60 * 60 * 24)));
        List<KidCalRitiro> kalR = mongo.find(q, KidCalRitiro.class);
        Assert.assertEquals("TEST_NOTE", kalR.get(0).getNote());
    }
}
