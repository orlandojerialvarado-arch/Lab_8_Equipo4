# Reporte de Pruebas Obligatorias - Laboratorio 8 (TRAZA-AGRO)

| ID | Prueba / Acción | Parámetros Enviados | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Registrar producto nuevo | Código: `P001`<br>Desc: `Cafe Peru`<br>Origen: `Cajamarca` | Éxito: Transacción minada y evento `ProductoRegistrado` emitido. | Transacción procesada correctamente con check verde. | **APROBADO** |
| **TC02** | Registrar P001 nuevamente (Duplicado) | Código: `P001` duplicado | Reversión: Aborto inmediato mediante error `ProductoYaExiste`. | Transacción revertida por la EVM con error estructurado. | **APROBADO** |
| **TC03** | Consultar P001 existente | Código: `P001` | Éxito: Retorna struct completo sin consumir gas (llamada view). | Muestra descripción, origen y estado `REGISTRADO`. | **APROBADO** |
| **TC04** | Actualizar estado de P001 | Código: `P001`<br>Estado: `1` (`TRANSPORTADO`) | Éxito: Modifica estado y emite `EstadoActualizado`. | Estado actualizado con éxito a `TRANSPORTADO`. | **APROBADO** |
| **TC05** | Consultar producto inexistente | Código: `P999` (No creado) | Reversión: Error `ProductoInexistente`. | Llamada revertida por condición de existencia. | **APROBADO** |
| **TC06** | Actualizar producto inexistente | Código: `P999`<br>Estado: `1` | Reversión: Bloquea mutación por error `ProductoInexistente`. | Reversión inmediata sin modificar almacenamiento. | **APROBADO** |
| **TC07** | Registrar dato IoT | Código: `P001`<br>Temp: `21.5 °C`<br>Fuente: `DHT22_TRUCK` | Éxito: Guarda telemetría y emite `LecturaIoTRegistrada`. | Lectura vinculada al producto y visible en consulta. | **APROBADO** |
| **TC08** | Actualizar con cuenta no autorizada | Cuenta intrusa sin rol de operador | Reversión: Modificador `soloAutorizados` lanza `NoAutorizado`. | Intento bloqueado con reversión de seguridad. | **APROBADO** |