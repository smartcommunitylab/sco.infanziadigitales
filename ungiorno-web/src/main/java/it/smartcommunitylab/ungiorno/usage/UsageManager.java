package it.smartcommunitylab.ungiorno.usage;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Sets;

import it.smartcommunitylab.ungiorno.services.RepositoryService;
import it.smartcommunitylab.ungiorno.usage.UsageEntity.UsageAction;

@Component
public class UsageManager {

	@Autowired
	private RepositoryService repository;
	
	private SimpleDateFormat osdf = new SimpleDateFormat("yy/MM/dd");
	private SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yy");
	
	public void messageSent(String appId, String schoolId, String fromId, String toId, String kidId, UsageAction action) {
		UsageEntity ue = new UsageEntity(fromId, toId, kidId, action, null, appId, schoolId);
		repository.saveUsageEntity(ue);
	}
	
	public void parentAction(String appId, String schoolId, String kidId, String parentId, UsageAction action) {
		UsageEntity ue = new UsageEntity(parentId, null, kidId, action, null, appId, schoolId);
		repository.saveUsageEntity(ue);
	}
	
	public String generateCSV(String appId, String schoolId) {
		StringBuffer sb = new StringBuffer();
		
		sb.append("Data,");

		List<Map<String, Integer>> typeCount = Lists.newArrayList();
		for (UsageAction a : UsageAction.values()){
			Map<String, Integer> tc = Maps.newTreeMap();
			typeCount.add(tc);
			countByQuery(repository.findUsageEntities(appId, schoolId, a), schoolId, tc);
			sb.append(a); sb.append(',');
		}
		sb.append("\r\n");
		
		for (String d: getDates(typeCount)) {
			sb.append(csvLine(d, typeCount));
		}
		
		return sb.toString();
	}	

	private void countByQuery(List<UsageEntity> result, String schoolId, Map<String, Integer> countByTimestamp) {
		Multimap<String, UsageEntity> map = ArrayListMultimap.create();
		for (UsageEntity ue: result) {
			map.put(osdf.format(new Date(ue.getTimestamp())), ue);
		}
		for (String day: map.keySet()) {
			countByTimestamp.put(day, map.get(day).size());
		}
	}		
	
		
	private Set<String> getDates(List<Map<String, Integer>> typeCount) {
		Set<String> dates = Sets.newTreeSet();
		for (Map<String, Integer> map: typeCount) {
			dates.addAll(map.keySet());
		}
		
		List<String> dl = Lists.newArrayList(dates);
		if (dl.size() == 0) return dates;
		Date start;
//		Date end = osdf.parse(dl.get(dl.size() - 1));
		Date end = new Date();
		try {
			start = osdf.parse(dl.get(0));

			Calendar cal = new GregorianCalendar();
			while (true) {
				cal.setTime(start);
				cal.add(Calendar.DAY_OF_YEAR, 1);
				start = cal.getTime();
				
				if (!start.before(end)) {
					break;
				}
				
				String day = osdf.format(start);
				if (!dates.contains(day)) {
					dates.add(day);
				}
			}

		} catch (ParseException e) {
		}
		
		return dates;
	}	
	
//	private Set<String> getDates(List<Map<String, Integer>> typeCount) {
//		Set<String> dates = Sets.newTreeSet();
//		typeCount.stream().forEach(x -> dates.addAll(x.keySet()));
//		return dates;
//	}
	
	
	private String csvLine(String date, List<Map<String, Integer>> typeCount) {
		StringBuffer sb = new StringBuffer();
		try {
			sb.append(sdf.format(osdf.parse(date)) + ",");
		} catch (ParseException e) {
		}
		for (Map<String, Integer> map: typeCount) {
			if (map.containsKey(date)) {
				sb.append(map.get(date) + ",");
			} else {
				sb.append("0,");
			}
		}
		sb.deleteCharAt(sb.length() - 1);
		sb.append("\r\n");
		return sb.toString();
	}	
	
}
