# Reports
This repository contains the raw web-reports produced during load testing.

This repository contains reports that were not discussed in the bachelors thesis but are kept here anyway,
in case theres someone interested in looking at different results that could be interesting, but 
discussing them in the thesis would not produce relevant data or realistic-ish scenarios.

The names of the reports follow a simple schema:

`<service>-<directory-size>-<vm-config>-<test>`

where:
* `service` is the directory service tested (OpenLDAP, Active Directory or ApacheDS)
* `directory-size` is the amount of entries in the directory
* `vm-config` specifies the characteristics of the virtual machine (base: 2 cores, 2GB RAM, 4g: 4 cores, 4GB RAM, tuned: directory service specific configuration, see thesis chapter 5.)
* `test` specifies the test plan that generated the result. (multi is the relevant one discussed in the thesis, the others may be incomplete or not available for all configurations and services).

The reports contain a lot more data than is discussed in the thesis, as it would be way beyond the scope set for it.
