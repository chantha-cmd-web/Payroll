import { getFirestore, doc, collection, onSnapshot, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { Employee, SystemSettings } from '../types';
import { FIRESTORE_DATABASE_ID } from './googleAuth';

const getDb = () => getFirestore(getApp(), FIRESTORE_DATABASE_ID);

export const syncFirestore = (
  userId: string,
  onDataUpdate: (employees: Employee[], settings: SystemSettings | null) => void,
  onError: (error: any) => void
) => {
  const db = getDb();
  
  const userRef = doc(db, 'users', userId);
  const employeesRef = collection(userRef, 'employees');

  let currentSettings: SystemSettings | null = null;
  let currentEmployees: Employee[] = [];

  const unsubSettings = onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && typeof data.exchangeRate === 'number') {
        currentSettings = data as SystemSettings;
        onDataUpdate(currentEmployees, currentSettings);
      }
    }
  }, onError);

  const unsubEmployees = onSnapshot(employeesRef, (snapshot) => {
    const emps: Employee[] = [];
    snapshot.forEach((doc) => {
      emps.push(doc.data() as Employee);
    });
    // Sort by id to keep consistent order
    emps.sort((a, b) => a.id - b.id);
    currentEmployees = emps;
    onDataUpdate(currentEmployees, currentSettings);
  }, onError);

  return () => {
    unsubSettings();
    unsubEmployees();
  };
};

export const saveSettingsToFirestore = async (userId: string, settings: SystemSettings) => {
  const db = getDb();
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, settings, { merge: true });
};

export const saveEmployeeToFirestore = async (userId: string, employee: Employee) => {
  const db = getDb();
  const userRef = doc(db, 'users', userId);
  const employeeRef = doc(collection(userRef, 'employees'), employee.id.toString());
  await setDoc(employeeRef, employee, { merge: true });
};

export const deleteEmployeeFromFirestore = async (userId: string, employeeId: number) => {
  const db = getDb();
  const userRef = doc(db, 'users', userId);
  const employeeRef = doc(collection(userRef, 'employees'), employeeId.toString());
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(employeeRef);
};

export const saveAllEmployeesToFirestore = async (userId: string, employees: Employee[]) => {
  const db = getDb();
  const userRef = doc(db, 'users', userId);
  const batch = writeBatch(db);
  
  employees.forEach((emp) => {
    const employeeRef = doc(collection(userRef, 'employees'), emp.id.toString());
    batch.set(employeeRef, emp, { merge: true });
  });

  await batch.commit();
};
