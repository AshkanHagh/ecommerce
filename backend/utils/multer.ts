import multer from 'multer';

const storage = multer.diskStorage({
    filename : function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

export const upload = multer({
	storage : storage
}).array('images');