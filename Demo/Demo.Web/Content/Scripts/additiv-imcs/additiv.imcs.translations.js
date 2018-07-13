if (!window.additiv) {
	var additiv = new Object();
}

if (!additiv.imcs) {
	additiv.imcs = new Object();
}

if (!additiv.imcs.translations) {

	additiv.imcs.translations = new Object();

	var translations = {
		flexigrid: {
			de: {
				errormsg: 'Verbindungsfehler',
				pagestat: 'Zeigt {from} bis {to} von {total} Einträgen',
				pagetext: 'Seite',
				outof: 'von',
				findtext: 'Finden',
				procmsg: 'In Bearbeitung, bitte warten ...',
				nomsg: 'Keine Einträge'
			},
			en: {
				errormsg: 'Connection Error',
				pagestat: 'Displaying {from} to {to} of {total} items',
				pagetext: 'Page',
				outof: 'of',
				findtext: 'Find',
				procmsg: 'Processing, please wait ...',
				nomsg: 'No items'
			}
		},
		common: {
			de: {
				pleaseselect: 'Bitte auswählen'
			},
			en: {
				pleaseselect: 'Please select'
			}
		},

		fileexplorer: {
			de: {
				browse: 'Durchsuchen',
				choosemediafile: 'Wähle eine Mediendatei',
				filemanageraction: 'Dateimanager Aktion',
				typenewname: 'Bitte geben Sie einen neuen Namen ein:',
				deletequestion_p1: 'Sind Sie sicher, dass Sie die Datei "',
				deletequestion_p2: '" löschen möchten?',
				fileuploadsuccess: 'Dateiupload war erfolgreich.',
				fileuploadfailure: 'Dateiupload ist fehlgeschlagen.'
			},
			en: {
				browse: 'Browse',
				choosemediafile: 'Choose media file',
				filemanageraction: 'File manager action',
				typenewname: 'Please type the new name:',
				deletequestion_p1: 'Are you sure you want to delete the "',
				deletequestion_p2: '" file?',
				fileuploadsuccess: 'File was successfuly uploaded.',
				fileuploadfailure: 'Failed of file uploading.'
			}
		},
		newslettertemplate: {
			de: {
				browse: 'SourceID anhängen',
				document: 'Dokument'
			},
			en: {
				browse: 'Add SourceID',
				document: 'Document'
			}
		}

	}

	additiv.imcs.translations = translations;
}