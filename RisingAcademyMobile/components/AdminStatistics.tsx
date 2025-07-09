+import React, { useState, useEffect } from 'react';
+import { 
+  View, 
+  Text, 
+  StyleSheet, 
+  ScrollView, 
+  TouchableOpacity,
+  Dimensions
+} from 'react-native';
+import { LinearGradient } from 'expo-linear-gradient';
+import { Ionicons } from '@expo/vector-icons';
+import { 
+  collection, 
+  query, 
+  onSnapshot
+} from 'firebase/firestore';
+import { db } from '../firebase.config';
+import { Application, WorkshopRegistration, ClubApplication, JobApplication, InternApplication } from '../types';
+import { 
+  startOfMonth, 
+  endOfMonth, 
+  startOfYear, 
+  endOfYear,
+  format
+} from 'date-fns';
+import { ar } from 'date-fns/locale';
+
+const { width } = Dimensions.get('window');
+
+const AdminStatistics = () => {
+  const [applications, setApplications] = useState<Application[]>([]);
+  const [workshopRegistrations, setWorkshopRegistrations] = useState<WorkshopRegistration[]>([]);
+  const [clubApplications, setClubApplications] = useState<ClubApplication[]>([]);
+  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
+  const [internApplications, setInternApplications] = useState<InternApplication[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [filterType, setFilterType] = useState<'month' | 'year'>('month');
+  const [selectedDate, setSelectedDate] = useState(new Date());
+
+  useEffect(() => {
+    const unsubscribes: (() => void)[] = [];
+
+    // Applications
+    const applicationsQuery = query(collection(db, 'applications'));
+    unsubscribes.push(onSnapshot(applicationsQuery, (snapshot) => {
+      const apps: Application[] = [];
+      snapshot.forEach((doc) => {
+        const data = doc.data();
+        apps.push({ 
+          id: doc.id, 
+          ...data,
+          submissionDate: data.submissionDate?.toDate() 
+        } as Application);
+      });
+      setApplications(apps);
+    }));
+
+    // Workshop Registrations
+    const workshopQuery = query(collection(db, 'workshopRegistrations'));
+    unsubscribes.push(onSnapshot(workshopQuery, (snapshot) => {
+      const regs: WorkshopRegistration[] = [];
+      snapshot.forEach((doc) => {
+        const data = doc.data();
+        regs.push({ 
+          id: doc.id, 
+          ...data,
+          registrationDate: data.registrationDate?.toDate() 
+        } as WorkshopRegistration);
+      });
+      setWorkshopRegistrations(regs);
+    }));
+
+    // Club Applications
+    const clubQuery = query(collection(db, 'clubApplications'));
+    unsubscribes.push(onSnapshot(clubQuery, (snapshot) => {
+      const apps: ClubApplication[] = [];
+      snapshot.forEach((doc) => {
+        const data = doc.data();
+        apps.push({ 
+          id: doc.id, 
+          ...data,
+          applicationDate: data.applicationDate?.toDate() 
+        } as ClubApplication);
+      });
+      setClubApplications(apps);
+    }));
+
+    // Job Applications
+    const jobQuery = query(collection(db, 'jobApplications'));
+    unsubscribes.push(onSnapshot(jobQuery, (snapshot) => {
+      const apps: JobApplication[] = [];
+      snapshot.forEach((doc) => {
+        const data = doc.data();
+        apps.push({ 
+          id: doc.id, 
+          ...data,
+          applicationDate: data.applicationDate?.toDate() 
+        } as JobApplication);
+      });
+      setJobApplications(apps);
+    }));
+
+    // Intern Applications
+    const internQuery = query(collection(db, 'internApplications'));
+    unsubscribes.push(onSnapshot(internQuery, (snapshot) => {
+      const apps: InternApplication[] = [];
+      snapshot.forEach((doc) => {
+        const data = doc.data();
+        apps.push({ 
+          id: doc.id, 
+          ...data,
+          applicationDate: data.applicationDate?.toDate() 
+        } as InternApplication);
+      });
+      setInternApplications(apps);
+      setLoading(false);
+    }));
+
+    return () => {
+      unsubscribes.forEach(unsubscribe => unsubscribe());
+    };
+  }, []);
+
+  const getFilteredData = () => {
+    const startDate = filterType === 'month' 
+      ? startOfMonth(selectedDate) 
+      : startOfYear(selectedDate);
+    const endDate = filterType === 'month' 
+      ? endOfMonth(selectedDate) 
+      : endOfYear(selectedDate);
+
+    return {
+      applications: applications.filter(app => 
+        app.submissionDate >= startDate && app.submissionDate <= endDate
+      ),
+      workshops: workshopRegistrations.filter(reg => 
+        reg.registrationDate >= startDate && reg.registrationDate <= endDate
+      ),
+      clubs: clubApplications.filter(app => 
+        app.applicationDate >= startDate && app.applicationDate <= endDate
+      ),
+      jobs: jobApplications.filter(app => 
+        app.applicationDate >= startDate && app.applicationDate <= endDate
+      ),
+      interns: internApplications.filter(app => 
+        app.applicationDate >= startDate && app.applicationDate <= endDate
+      )
+    };
+  };
+
+  const getChartData = () => {
+    const filtered = getFilteredData();
+    
+    if (filterType === 'month') {
+      // Weekly data for the month
+      const weeks = [];
+      const startDate = startOfMonth(selectedDate);
+      const endDate = endOfMonth(selectedDate);
+      
+      for (let week = 1; week <= 4; week++) {
+        const weekStart = new Date(startDate);
+        weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
+        const weekEnd = new Date(weekStart);
+        weekEnd.setDate(weekEnd.getDate() + 6);
+        
+        if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
+        
+        weeks.push({
+          label: `الأسبوع ${week}`,
+          applications: filtered.applications.filter(app => 
+            app.submissionDate >= weekStart && app.submissionDate <= weekEnd
+          ).length,
+          workshops: filtered.workshops.filter(reg => 
+            reg.registrationDate >= weekStart && reg.registrationDate <= weekEnd
+          ).length,
+          clubs: filtered.clubs.filter(app => 
+            app.applicationDate >= weekStart && app.applicationDate <= weekEnd
+          ).length,
+          jobs: filtered.jobs.filter(app => 
+            app.applicationDate >= weekStart && app.applicationDate <= weekEnd
+          ).length,
+          interns: filtered.interns.filter(app => 
+            app.applicationDate >= weekStart && app.applicationDate <= weekEnd
+          ).length
+        });
+      }
+      
+      return weeks;
+    } else {
+      // Quarterly data for the year
+      const quarters = [
+        { label: 'الربع الأول', start: 0, end: 2 },
+        { label: 'الربع الثاني', start: 3, end: 5 },
+        { label: 'الربع الثالث', start: 6, end: 8 },
+        { label: 'الربع الرابع', start: 9, end: 11 }
+      ];
+      
+      return quarters.map(quarter => {
+        const quarterStart = new Date(selectedDate.getFullYear(), quarter.start, 1);
+        const quarterEnd = new Date(selectedDate.getFullYear(), quarter.end + 1, 0);
+        
+        return {
+          label: quarter.label,
+          applications: applications.filter(app => 
+            app.submissionDate >= quarterStart && app.submissionDate <= quarterEnd
+          ).length,
+          workshops: workshopRegistrations.filter(reg => 
+            reg.registrationDate >= quarterStart && reg.registrationDate <= quarterEnd
+          ).length,
+          clubs: clubApplications.filter(app => 
+            app.applicationDate >= quarterStart && app.applicationDate <= quarterEnd
+          ).length,
+          jobs: jobApplications.filter(app => 
+            app.applicationDate >= quarterStart && app.applicationDate <= quarterEnd
+          ).length,
+          interns: internApplications.filter(app => 
+            app.applicationDate >= quarterStart && app.applicationDate <= quarterEnd
+          ).length
+        };
+      });
+    }
+  };
+
+  const chartData = getChartData();
+  const filtered = getFilteredData();
+  const maxValue = Math.max(...chartData.map(d => 
+    d.applications + d.workshops + d.clubs + d.jobs + d.interns
+  ));
+
+  if (loading) {
+    return (
+      <View style={styles.loadingContainer}>
+        <Text style={styles.loadingText}>جاري تحميل الإحصائيات...</Text>
+      </View>
+    );
+  }
+
+  return (
+    <ScrollView style={styles.container}>
+      {/* Filter Controls */}
+      <View style={styles.filterContainer}>
+        <View style={styles.filterButtons}>
+          <TouchableOpacity
+            style={[styles.filterButton, filterType === 'month' && styles.activeFilterButton]}
+            onPress={() => setFilterType('month')}
+          >
+            <Text style={[styles.filterButtonText, filterType === 'month' && styles.activeFilterButtonText]}>
+              شهري
+            </Text>
+          </TouchableOpacity>
+          <TouchableOpacity
+            style={[styles.filterButton, filterType === 'year' && styles.activeFilterButton]}
+            onPress={() => setFilterType('year')}
+          >
+            <Text style={[styles.filterButtonText, filterType === 'year' && styles.activeFilterButtonText]}>
+              سنوي
+            </Text>
+          </TouchableOpacity>
+        </View>
+      </View>
+
+      {/* Summary Cards */}
+      <View style={styles.summaryContainer}>
+        {[
+          { title: 'طلبات الدورات', value: filtered.applications.length, color: '#22b0fc', icon: 'school-outline' },
+          { title: 'تسجيلات الورش', value: filtered.workshops.length, color: '#f59e0b', icon: 'calendar-outline' },
+          { title: 'طلبات النوادي', value: filtered.clubs.length, color: '#8b5cf6', icon: 'people-outline' },
+          { title: 'طلبات التوظيف', value: filtered.jobs.length, color: '#10b981', icon: 'briefcase-outline' },
+          { title: 'طلبات التدريب', value: filtered.interns.length, color: '#6366f1', icon: 'person-add-outline' },
+        ].map((stat, index) => (
+          <View key={index} style={styles.summaryCard}>
+            <LinearGradient
+              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
+              style={styles.summaryCardGradient}
+            >
+              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
+              <Text style={styles.summaryValue}>{stat.value}</Text>
+              <Text style={styles.summaryTitle}>{stat.title}</Text>
+            </LinearGradient>
+          </View>
+        ))}
+      </View>
+
+      {/* Chart */}
+      <View style={styles.chartContainer}>
+        <LinearGradient
+          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
+          style={styles.chartGradient}
+        >
+          <View style={styles.chartHeader}>
+            <Text style={styles.chartTitle}>المنحنى البياني</Text>
+            <Text style={styles.chartSubtitle}>
+              {format(selectedDate, filterType === 'month' ? 'MMMM yyyy' : 'yyyy', { locale: ar })}
+            </Text>
+          </View>
+          
+          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
+            <View style={styles.chart}>
+              {chartData.map((data, index) => {
+                const total = data.applications + data.workshops + data.clubs + data.jobs + data.interns;
+                const height = maxValue > 0 ? (total / maxValue) * 120 : 0;
+                
+                return (
+                  <View key={index} style={styles.chartBar}>
+                    <View style={styles.barContainer}>
+                      <View 
+                        style={[
+                          styles.bar, 
+                          { 
+                            height: height,
+                            backgroundColor: total > 0 ? '#22b0fc' : '#e5e7eb'
+                          }
+                        ]} 
+                      />
+                      <Text style={styles.barValue}>{total}</Text>
+                    </View>
+                    <Text style={styles.barLabel}>{data.label}</Text>
+                  </View>
+                );
+              })}
+            </View>
+          </ScrollView>
+          
+          {/* Legend */}
+          <View style={styles.legend}>
+            {[
+              { label: 'دورات', color: '#22b0fc' },
+              { label: 'ورش', color: '#f59e0b' },
+              { label: 'نوادي', color: '#8b5cf6' },
+              { label: 'وظائف', color: '#10b981' },
+              { label: 'تدريب', color: '#6366f1' },
+            ].map((item, index) => (
+              <View key={index} style={styles.legendItem}>
+                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
+                <Text style={styles.legendText}>{item.label}</Text>
+              </View>
+            ))}
+          </View>
+        </LinearGradient>
+      </View>
+    </ScrollView>
+  );
+};
+
+const styles = StyleSheet.create({
+  container: {
+    flex: 1,
+  },
+  loadingContainer: {
+    flex: 1,
+    justifyContent: 'center',
+    alignItems: 'center',
+  },
+  loadingText: {
+    color: '#ffffff',
+    fontSize: 16,
+  },
+  filterContainer: {
+    marginBottom: 20,
+  },
+  filterButtons: {
+    flexDirection: 'row',
+    backgroundColor: 'rgba(255, 255, 255, 0.95)',
+    borderRadius: 8,
+    padding: 4,
+  },
+  filterButton: {
+    flex: 1,
+    paddingVertical: 8,
+    paddingHorizontal: 16,
+    borderRadius: 6,
+    alignItems: 'center',
+  },
+  activeFilterButton: {
+    backgroundColor: '#22b0fc',
+  },
+  filterButtonText: {
+    fontSize: 14,
+    fontWeight: '600',
+    color: '#6b7280',
+  },
+  activeFilterButtonText: {
+    color: '#ffffff',
+  },
+  summaryContainer: {
+    flexDirection: 'row',
+    flexWrap: 'wrap',
+    gap: 8,
+    marginBottom: 20,
+  },
+  summaryCard: {
+    width: (width - 48) / 2,
+    borderRadius: 12,
+    overflow: 'hidden',
+  },
+  summaryCardGradient: {
+    padding: 12,
+    alignItems: 'center',
+  },
+  summaryValue: {
+    fontSize: 18,
+    fontWeight: 'bold',
+    color: '#1f2937',
+    marginTop: 8,
+  },
+  summaryTitle: {
+    fontSize: 10,
+    color: '#6b7280',
+    marginTop: 4,
     textAlign: 'center',
   },
-  statsGrid: {
+  chartContainer: {
+    borderRadius: 16,
+    overflow: 'hidden',
+    marginBottom: 20,
+  },
+  chartGradient: {
+    padding: 16,
+  },
+  chartHeader: {
+    alignItems: 'center',
+    marginBottom: 16,
+  },
+  chartTitle: {
+    fontSize: 16,
+    fontWeight: 'bold',
+    color: '#1f2937',
+  },
+  chartSubtitle: {
+    fontSize: 12,
+    color: '#6b7280',
+    marginTop: 4,
+  },
+  chartScrollView: {
+    marginBottom: 16,
+  },
+  chart: {
     flexDirection: 'row',
-    flexWrap: 'wrap',
-    gap: 12,
+    alignItems: 'flex-end',
+    height: 140,
+    paddingHorizontal: 8,
   },
-  statCard: {
-    width: '48%',
+  chartBar: {
+    alignItems: 'center',
+    marginHorizontal: 8,
+  },
+  barContainer: {
+    alignItems: 'center',
+    justifyContent: 'flex-end',
+    height: 120,
+  },
+  bar: {
+    width: 20,
     borderRadius: 12,
-    overflow: 'hidden',
-    shadowColor: '#000',
-    shadowOffset: {
-      width: 0,
-      height: 2,
-    },
-    shadowOpacity: 0.2,
-    shadowRadius: 4,
-    elevation: 4,
+    minHeight: 4,
   },
-  statCardGradient: {
-    padding: 16,
+  barValue: {
+    fontSize: 10,
+    fontWeight: 'bold',
+    color: '#1f2937',
+    marginTop: 4,
+  },
+  barLabel: {
+    fontSize: 10,
+    color: '#6b7280',
+    marginTop: 8,
+    textAlign: 'center',
+    width: 60,
+  },
+  legend: {
+    flexDirection: 'row',
+    flexWrap: 'wrap',
+    justifyContent: 'center',
+    gap: 12,
+    paddingTop: 12,
+    borderTopWidth: 1,
+    borderTopColor: '#e5e7eb',
+  },
+  legendItem: {
+    flexDirection: 'row',
     alignItems: 'center',
-    minHeight: 100,
-    justifyContent: 'center',
+    gap: 4,
   },
-  statTitle: {
-    fontSize: 14,
-    fontWeight: '600',
-    color: '#1f2937',
-    textAlign: 'center',
-    marginTop: 8,
-    marginBottom: 4,
+  legendColor: {
+    width: 8,
+    height: 8,
+    borderRadius: 4,
   },
-  statNote: {
+  legendText: {
     fontSize: 12,
     color: '#6b7280',
-    textAlign: 'center',
   },
 });
 
-export default AdminDashboard;
+export default AdminStatistics;