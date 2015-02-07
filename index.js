
var emit = require( 'emit-bindings' ),
    dom = require( 'domla' ),
    div = dom.div,
    button = dom.button,
    form = dom.form,
    input = dom.input,
    hr = dom.hr,
    p = dom.p;

function Upload( attrs ){
    this.attributes = attrs;
}

Upload.prototype = {
    open: function( meta, skoll, done ) {
        this.skoll = skoll;
        emit.on( 'skoll.upload.submit', this.onSubmit.bind( this ) );
        emit.on( 'skoll.upload.trigger', this.onTrigger.bind( this ) );
        this.render( meta, done );
    },
    teardown: function() {
        // clear out some cache
        this.upload = null;
        this.input = null;
        this.container = null;
        this.skoll = null;
        emit.removeAllListeners( 'skoll.upload.submit' );
        emit.removeAllListeners( 'skoll.upload.trigger' );
    },
    onSubmit: function( e ) {

        e.preventDefault();

        var input = this.input,
            value = input.value,
            event = {
                files: [{
                    url: value
                }]
            };

        this.skoll.preview( event );
    },
    onChange: function( e ) {
        this.skoll.preview( e.target );
    },
    onTrigger: function( e ) {
        this.upload.dispatchEvent( new MouseEvent( 'click' ) ); // proxy event to upload
    },
    render: function( meta, done ) {

        var leaveBuffer, 
            classList;
        
        function dragOver() {
            clearTimeout( leaveBuffer );
            if ( classList.contains( 'skoll-upload-drag-over' ) ) return;
            classList.add( 'skoll-upload-drag-over' );
        }

        function dragLeave() {
            classList.remove( 'skoll-upload-drag-over' );
            classList.remove( 'skoll-upload-show' );
        }

        function showOver() {
            if ( classList.remove( 'skoll-upload-show' ) ) return;
            classList.add( 'skoll-upload-show' );
        }
        
        this.input = input( { 
            type: 'url', 
            value: meta.url || '' 
        } );
        this.upload = input( { 
            className: 'skoll-upload-input', 
            type: 'file', 
            onChange: this.onChange.bind( this ) 
        } );
        this.dropzone = (
            div( { className: 'skoll-upload-dropzone', onDragOver: dragOver, onDragLeave: dragLeave, onDrop: dragLeave },
                p( 'Drop your images here!' ),
                this.upload
            )
        );
        this.el = (
            div( { className: 'skoll-upload-plugin' },
                div( { className: 'skoll-upload-url' },
                    button( { className: 'skoll-button', 'data-emit': 'skoll.upload.trigger' }, 'Upload A File' ),
                    p( 'Drag files here to upload' )
                ),
                hr(),
                form( { className: 'skoll-upload-form', 'data-emit': 'skoll.upload.submit' },
                    p ( 'Use a URL:' ),
                    this.input,
                    button( { className: 'skoll-button' }, 'Submit' )
                ),
                this.dropzone
            )
        );
        
        classList = this.dropzone.classList;
        this.skoll.el.removeEventListener( 'dragover', showOver );
        this.skoll.el.addEventListener( 'dragover', showOver );
        
        if ( meta.multiple ) {
            this.upload.setAttribute( 'multiple', true );
        }
        done( null, this.el );
    }
};

module.exports = new Upload( {
    name: 'upload'
} );
