package it.smartcommunitylab.ungiorno.importer;

import it.smartcommunitylab.ungiorno.model.AuthPerson;
import it.smartcommunitylab.ungiorno.model.KidProfile;
import it.smartcommunitylab.ungiorno.model.SchoolProfile;
import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.utils.Utils;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.Lists;

public class ImportData {
	private static final transient Logger logger = LoggerFactory.getLogger(ImportData.class);
	
	public static List<KidProfile> readChildren(InputStream excel,
			String appId, RepositoryService storage) throws Exception {
		Map<String, KidProfile> result = new HashMap<String, KidProfile>();
		if(logger.isInfoEnabled()) {
			logger.info("readChildren:start import");
		}
		XSSFWorkbook wb = new XSSFWorkbook(excel);
		try {
			XSSFSheet sheet = wb.getSheet("SMA1359480652504");
			if(sheet == null) {
				throw new ImportError("data sheet not found");
			}
			DataFormatter fmt = new DataFormatter();
			for(int i=1; i <= sheet.getLastRowNum(); i++) {
				Row row = sheet.getRow(i);
				String cognomeGen = row.getCell(0).getStringCellValue();
				String nomeGen = row.getCell(1).getStringCellValue();
				String cfGen = row.getCell(2).getStringCellValue();
				String telGen = fmt.formatCellValue(row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK));
				String cognomeAlunno = row.getCell(4).getStringCellValue();
				String nomeAlunno = row.getCell(5).getStringCellValue();
				Date dataAlunno = row.getCell(6).getDateCellValue();
				String cfAlunno = row.getCell(7).getStringCellValue();
				String sessoAlunno = row.getCell(8).getStringCellValue();
				String scuolaAlunno = row.getCell(9).getStringCellValue();
				//String iscrizioneAlunno = row.getCell(10).getStringCellValue();

				if(logger.isInfoEnabled()) {
					logger.info("readChild:" + cfAlunno);
				}
				
				KidProfile kid = result.get(cfAlunno);
				if(kid == null) {
					kid = new KidProfile();
					kid.setAppId(appId);
					kid.setKidId(cfAlunno);
					kid.setFullName(nomeAlunno + " " + cognomeAlunno);
					kid.setFirstName(nomeAlunno);
					kid.setLastName(cognomeAlunno);
					kid.setBirthDate(dataAlunno);
					kid.setGender(getGender(sessoAlunno));
					SchoolProfile schoolProfile = storage.getSchoolProfileByName(appId, scuolaAlunno);
					if(schoolProfile == null) {
						logger.error("School not found:" + scuolaAlunno);
						continue;
					}
					kid.setSchoolId(schoolProfile.getSchoolId());
					kid.setPersons(new ArrayList<AuthPerson>());
					result.put(cfAlunno, kid);
				}
				
				AuthPerson person = new AuthPerson();
				person.setPersonId(cfGen);
				person.setFullName(nomeGen + " " + cognomeGen);
				person.setFirstName(nomeGen);
				person.setLastName(cognomeGen);
				if(Utils.isNotEmpty(telGen)) {
					person.setPhone(Lists.newArrayList(telGen));
				}
				person.setParent(true);
				kid.getPersons().add(person);
			}
		} catch (Exception e) {
			throw e;
		} finally {
			wb.close();
		}
		if(logger.isInfoEnabled()) {
			logger.info("readChildren:kids read " + result.values().size());
		}
		return new ArrayList<KidProfile>(result.values());
	}
	
	public static String getGender(String sessoAlunno) {
		if(sessoAlunno.equals("M")) {
			return "Maschio";
		} else {
			return "Femmina";
		}
	}
}
