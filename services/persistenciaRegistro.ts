import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'registroAlumno.db';
const TABLE_NAME = 'registro';

function isWeb() {
  return Platform.OS === 'web';
}

/**
 * Servicio universal de persistencia para el registro de alumno.
 * Usa SQLite en móvil y AsyncStorage en web.
 */
export const persistenciaRegistro = {
  /**
   * Guarda el estado del registro localmente.
   * @param data Estado serializable
   */
  async guardar(data: any) {
    if (isWeb()) {
      await AsyncStorage.setItem('registroAlumno', JSON.stringify(data));
    } else {
      const db = SQLite.openDatabase(DB_NAME);
      db.transaction((tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (id INTEGER PRIMARY KEY NOT NULL, data TEXT);`
        );
        tx.executeSql(
          `INSERT OR REPLACE INTO ${TABLE_NAME} (id, data) VALUES (1, ?);`,
          [JSON.stringify(data)]
        );
      });
    }
  },

  /**
   * Lee el estado del registro localmente.
   * @returns Estado serializado o null
   */
  async leer(): Promise<any | null> {
    if (isWeb()) {
      const data = await AsyncStorage.getItem('registroAlumno');
      return data ? JSON.parse(data) : null;
    } else {
      return new Promise((resolve) => {
        const db = SQLite.openDatabase(DB_NAME);
        db.transaction((tx: SQLite.SQLTransaction) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (id INTEGER PRIMARY KEY NOT NULL, data TEXT);`
          );
          tx.executeSql(
            `SELECT data FROM ${TABLE_NAME} WHERE id = 1;`,
            [],
            (_: SQLite.SQLTransaction, result: SQLite.SQLResultSet) => {
              if (result.rows.length > 0) {
                resolve(JSON.parse(result.rows.item(0).data));
              } else {
                resolve(null);
              }
            },
            () => { resolve(null); return false; } // En caso de error
          );
        });
      });
    }
  },

  /**
   * Limpia el estado del registro localmente.
   */
  async limpiar() {
    if (isWeb()) {
      await AsyncStorage.removeItem('registroAlumno');
    } else {
      const db = SQLite.openDatabase(DB_NAME);
      db.transaction((tx: SQLite.SQLTransaction) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (id INTEGER PRIMARY KEY NOT NULL, data TEXT);`
        );
        tx.executeSql(`DELETE FROM ${TABLE_NAME} WHERE id = 1;`);
      });
    }
  }
}; 