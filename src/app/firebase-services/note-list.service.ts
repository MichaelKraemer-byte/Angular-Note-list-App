import { Injectable, inject, OnDestroy  } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { query, orderBy, limit, where, Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NoteListService implements OnDestroy {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  // items$;
  // items;
  firestore: Firestore = inject(Firestore); // hier kriege ich zugriff auf den Firestore mit der Variable firestore.


  unsubNotes;
  unsubTrash;
  unsubNormalMarkedNotes;
  // unsubSingle;

  constructor() { 
    this.unsubTrash = this.subTrashList();
    this.unsubNotes = this.subNotesList();
    this.unsubNormalMarkedNotes = this.subNormalMarkedNotesList();
  }

  async deleteNote(colId: string, docId: string){
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch( 
    //mit delete loescht man ganze collections. 
    // um einzelne documents aus einer colelction zu loeschen, brauche ich "updateDoc"
    (error) => {console.log(error)} )      
  }

  async updateNote(note: Note){
    console.log('outside if abfrage von updateNote');

    if (note.id) {
      console.log('inside if abfrage von updateNote');

      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (error) => { console.log(error)}
      ).then(() => {    
          console.log("Document updated ");
        })
    }
  }

  getColIdFromNote(note:Note){
    if (note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  getCleanJson(note: Note){
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }

  async addNote(note: Note, colId: "notes" | "trash") {
    if (colId == 'notes') {
      await addDoc(this.getNotesRef(), note).catch(
        (error) => { console.error(error)}
      ).then(
        (docRef) => {    
          console.log("Document written with ID: ", docRef?.id);
        }
      )
    } else if (colId == 'trash') {
      await addDoc(this.getTrashRef(), note).catch(
        (error) => { console.error(error)}
      ).then(
        (docRef) => {    
          console.log("Document written with ID: ", docRef?.id);
        }
      )
    }
  } // addDoc(Reference(in diesem fall 'notes' oder 'trash'), item (das hinzugefuegt werden soll)) - dann .catch & .then block als ueberpruefung (try-cach-block) geht auch)

  subTrashList(){
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });

    // bei onSnapshot mit "element".data()  kriege ich die ganzen documents einer collection
    // andernfalls nur mit 'element' kriege ich alle dateien der collection token (id, existss, ...)

    // unsubList wird definiert, um spaeter den subscription process wieder zu beenden. hier im constructor wird er mit onSnapshot direkt geschrieben,
    // um die Daten als erstes zu bekommen und den Prozess in den Gang zu schieben. 
    // beendet werden kann der process mit ngOnDestroy.
  }

  subNotesList(){
    const q = query(this.getNotesRef(), limit(100)); 
    // limit limitiert die Anzahl der angezeigten element;
    // where() filtert nach eine if-abfrage
    // orderBy ordnet nach Alphabet :) 
    // orderBy() funktioniert aber nicht mit where() zusammen. 
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNormalMarkedNotesList(){
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(10)); 
    // limit limitiert die Anzahl der angezeigten element;
    // where() filtert nach eine if-abfrage
    // orderBy ordnet nach Alphabet :) 
    // orderBy() funktioniert aber nicht mit where() zusammen. 
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  ngOnDestroy() {
    // Die Subscriptions beenden
    if (this.unsubTrash) {
      this.unsubTrash();
    }
    if (this.unsubNotes) {
      this.unsubNotes();
    }
    if (this.unsubNormalMarkedNotes) {
      this.unsubNormalMarkedNotes();
    }
    console.log("All Firestore subscriptions have been unsubscribed.");
  }

  getNotesRef(){
    return collection(this.firestore, 'notes');
  }

  getTrashRef(){
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string){    
    return doc(collection(this.firestore, colId), docId)
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false
    }
  }


      // this.items$ = collectionData(this.getNotesRef());

      // this.items$ = collectionData(this.getNotesRef(), { idField: 'id' })
      // this.items = this.items$.subscribe((list) => {
      //   list.forEach(element => {
      //     // console.log(element);
      //     console.log(this.setNoteObject(element, element.id))
      //   })
      // })

      // bei collectionData erhalte ich ein Array aus Objekten der Dokumentendateien (aus der Firebase) - standardmaessig ohne id. 
      // wenn ich die id haben moechte brauche ich { idField: 'id' } innerhalb der funktion:  this.items$ = collectionData(this.getNotesRef(), { idField: 'id' });

      //bei collectionData wird nur bei aenderungen in der firebase die daten aktualisiert - und sonst nicht - d.h. es ist kein ngOnDestroy notwendig
      // denn collectionData startet und beendet den Prozess automatisch - je nach Aenderungen in der Firebase.
      // man kann aber ngOnDestroy werden, wenn man moechte, sobald man subscribe innherlab der collectionData funktion verwendet.

}
