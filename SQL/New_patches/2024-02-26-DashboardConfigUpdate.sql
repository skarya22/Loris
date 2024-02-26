INSERT INTO ConfigSettings (Name, Description, Visible, AllowMultiple, DataType, Parent, Label, OrderNumber) SELECT 'dashboardCharts', 'JSON object of chart details in Dashboard widgets.', 1, 1, 'textarea', ID, 'Dashboard Charts', 1 FROM ConfigSettings WHERE Name="dashboard";
INSERT INTO Config (ConfigID, Value) SELECT ID, '{
    "chartID": "siterecruitment_bysex",
    "panel": "Site Breakdown",
    "title": "Total Recruitment per Site by Sex",
    "options": {
        "bar": "bar",
        "pie": "pie"
    },
    "sizing": 5,
    "idColumn": "t.RegistrationCenterID",
    "targetTable": "candidate",
    "extraWhere": "AND t.RegistrationCenterID IN (siteIDs)",
    "dataType": "site",
    "dataLabels": [
        "Male",
        "Female"
    ],
    "groupedBy": "t.Sex"
}' FROM ConfigSettings WHERE Name="dashboardCharts";
INSERT INTO Config (ConfigID, Value) SELECT ID, '{
    "chartID": "agerecruitment_pie",
    "panel": "Site Breakdown",
    "title": "Total Recruitment by Age",
    "options": {
        "bar": "bar",
        "pie": "pie"
    },
    "sizing": 5,
    "idColumn": "FLOOR(DATEDIFF(t.date_registered, t.DoB) \/ 365.25 \/ 10) * 10",
    "targetTable": "candidate",
    "extraWhere": "AND t.DoB IS NOT NULL AND t.DoB <= t.date_registered",
    "dataType": "ageSplit",
    "dataLabels": [
        "Age (Years)"
    ],
    "groupedBy": ""
}' FROM ConfigSettings WHERE Name="dashboardCharts";
INSERT INTO Config (ConfigID, Value) SELECT ID, '{
    "chartID": "ethnicity",
    "panel": "Site Breakdown",
    "sizing": 5,
    "title": "Ethnicity at Screening",
    "idColumn": " t.Ethnicity",
    "chartType": "bar",
    "targetTable": "candidate",
    "label": "Ethnicity",
    "extraWhere": "AND t.Entity_type=\'Human\'",
    "options": {
        "bar": "bar",
        "pie": "pie"
    },
    "dataType": "",
    "dataLabels": [
        "Participants"
    ],
    "groupedBy": ""
}' FROM ConfigSettings WHERE Name="dashboardCharts";
INSERT INTO Config (ConfigID, Value) SELECT ID, '{
    "chartID": "siterecruitment_pie",
    "panel": "Site Breakdown",
    "sizing": 5,
    "title": "Total Recruitment per Site",
    "idColumn": "t.RegistrationCenterID",
    "targetTable": "candidate",
    "label": "Ethnicity",
    "extraWhere": "AND t.Entity_type=\'Human\' AND t.Active=\'Y\' AND t.RegistrationCenterID IN (siteIDs)",
    "options": {
        "pie": "pie",
        "bar": "bar"
    },
    "dataType": "site",
    "dataLabels": [
        "Ethnicity (Count)"
    ],
    "groupedBy": ""
}' FROM ConfigSettings WHERE Name="dashboardCharts";