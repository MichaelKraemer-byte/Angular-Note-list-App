import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, collection, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  firestore: Firestore = inject(Firestore); // hier kriege ich zugriff auf den Firestore mit der Variable firestore.

  constructor() { }

  // hier kriege ich zugriff auf den Firestore mit der Variable mit collection(this.firestore, 'auswahl')
  getNotesRef(){
    return collection(this.firestore, ' notes)');
  }

  getTrashRef(){
    return collection(this.firestore, ' trash)');
  }

  getSingleDocRef(colId: string, docId: string){
    return doc(collection(this.firestore, colId), docId)
  }
   // weil erst collection ausgefuehrt wird und danach erst doc, muss dazwischen ein ','
   // getSingleDocRef ermoeglicht den Zugriff auf die werte in diesen "ordnern"

}
