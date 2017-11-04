PackageDeclaration
   : package <packageName-joined-by.>* ;

Import
   : import <packageName-joined-by.>* ;

Identifier
   : <value>
   ;

Abort
   : abort ;
   ;

Action
   : <annotationAttachments>* action <name.value> ( <parameters-joined-by,>* ) ( <returnParameters-joined-by,>+ ) { <body.source> <workers>* }
   | <annotationAttachments>* action <name.value> ( <parameters-joined-by,>* )                                    { <body.source> <workers>* }
   ;

Annotation
   : annotation <name.value> { <attributes-suffixed-by-;>* }
   | annotation <name.value> attach resource { }
   ;

AnnotationAttachment
   : @ <packageAlias.value> : <annotationName.value> { <attributes-joined-by,>* }
   | @ <annotationName.value> { <attributes-joined-by,>* }
   ;

AnnotationAttachmentAttribute
   : <name> : <value.source>
   ;

AnnotationAttachmentAttributeValue
   : <value.source>
   | [ <valueArray-joined-by,>+ ]
   ;

AnnotationAttribute
   : <typeNode.source> <name.value> = <initialExpression.source>
   | <typeNode.source> <name.value>
   ;

ArrayLiteralExpr
   : [ <expressions-joined-by,>* ]
   ;

Assignment
   : <declaredWithVar?var> <variables-joined-by,>* = <expression.source> ;
   ;

BinaryExpr
   : <inTemplateLiteral?> {{ <leftExpression.source> <operatorKind> <rightExpression.source> }}
   |             <leftExpression.source> <operatorKind> <rightExpression.source>
   ;

Bind
    : bind <expression.source> with <variable.source> ;
    ;

Block
   : <statements>*
   | 
   ;

Break
   : break ;
   ;

BuiltInRefType
   : <typeKind>
   ;

Catch
   : catch ( <parameter.source> ) { <body.source> }
   ;

Comment
   : <comment>
   ;

Connector
   : <annotationAttachments>* <public?public> connector <name.value> ( <parameters-joined-by,>* ) { <variableDefs>* <actions>* }
   | <annotationAttachments>* <public?public> connector <name.value> ( <parameters-joined-by,>* ) { <actions>* }
   ;

ConnectorInitExpr
   : create <connectorType.source> ( <expressions-joined-by,>* )
   | create <connectorType.source> ( )
   ;

ConstrainedType
   : <type.source> < <constraint.source> >
   ;

EndpointType
   : < <constraint.source> >
   ;

ExpressionStatement
   : <expression.source> ;
   ;

FieldBasedAccessExpr
   : <expression.source> . <fieldName.value>
   ;

ForkJoin
   : fork { <workers>* } join ( <joinType> <joinCount> <joinedWorkerIdentifiers-joined-by,>* ) ( <joinResultVar.source> ) { <joinBody.source> } timeout ( <timeOutExpression.source> ) ( <timeOutVariable.source> ) { <timeoutBody.source> }
   : fork { <workers>* } join ( <joinType> <joinCount> <joinedWorkerIdentifiers-joined-by,>* ) ( <joinResultVar.source> ) { <joinBody.source> }
   : fork { <workers>* } join ( <joinType> <joinCount> <joinedWorkerIdentifiers-joined-by,>* ) ( <joinResultVar.source> ) { }
   : fork { <workers>* } join ( <joinType> <joinedWorkerIdentifiers-joined-by,>* ) ( <joinResultVar.source> ) { <joinBody.source> } timeout ( <timeOutExpression.source> ) ( <timeOutVariable.source> ) { <timeoutBody.source> }
   : fork { <workers>* } join ( <joinType> <joinedWorkerIdentifiers-joined-by,>* ) ( <joinResultVar.source> ) { <joinBody.source> }
   | fork { <workers>* } join ( <joinType> <joinedWorkerIdentifiers-joined-by,>* ) ( <joinResultVar.source> ) { }
   ;

Function
   : <lambda?> <annotationAttachments>* function              ( <parameters-joined-by,>* ) ( <returnParameters-joined-by,>+ ) { <body.source> <workers>* }
   | <lambda?> <annotationAttachments>* function              ( <parameters-joined-by,>* ) { <body.source> <workers>* }
   |           <annotationAttachments>* <public?public> function < <receiver.source> > <name.value> ( <parameters-joined-by,>* ) ( <returnParameters-joined-by,>+ ) { <body.source> <workers>* }
   |           <annotationAttachments>* <public?public> function <name.value> ( <parameters-joined-by,>* ) ( <returnParameters-joined-by,>+ ) { <body.source> <workers>* }
   |           <annotationAttachments>* <public?public> function < <receiver.source> > <name.value> ( <parameters-joined-by,>* ) { <body.source> <workers>* }
   |           <annotationAttachments>* <public?public> function <name.value> ( <parameters-joined-by,>* ) { <body.source> <workers>* }
   ;

FunctionType
   : function ( <paramTypeNode-joined-by,>* ) <returnKeywordExists?returns> ( <returnParamTypeNode>+ )
   | function ( <paramTypeNode-joined-by,>* )
   ;

If
   : <ladderParent?> if ( <condition.source> ) { <body.source> } else   <elseStatement.source>
   |                 if ( <condition.source> ) { <body.source> } else { <elseStatement.source> }
   |                 if ( <condition.source> ) { <body.source> }
   ;

IndexBasedAccessExpr
   : <expression.source> [ <index.source> ]
   ;

Invocation
   : <expression.source>  .   <name.value> ( <argumentExpressions-joined-by,>* )
   | <packageAlias.value> :   <name.value> ( <argumentExpressions-joined-by,>* )
   |                          <name.value> ( <argumentExpressions-joined-by,>* )
   ;

Lambda
   : <functionNode.source>
   ;

Literal
   : <inTemplateLiteral?> <unescapedValue>
   : <inTemplateLiteral?>
   | <value>
   ;

Next
   : next ;
   ;

RecordLiteralExpr
   : { <keyValuePairs-joined-by,>* }
   | { }
   ;

RecordLiteralKeyValue
   : <key.source> : <value.source>
   ;

Resource
   : <annotationAttachments>* resource <name.value> ( <parameters-joined-by,>* ) { <body.source> <workers>* }
   ;

Retry
   : retry <count> ;
   ;

Return
   : return <expressions-joined-by-,>* ;
   ;

Service
   : <annotationAttachments>* service < <protocolPackageIdentifier.value> > <name.value> { <variables>* <resources>* }
   ;

SimpleVariableRef
   : <inTemplateLiteral?> {{ <packageAlias.value> : <variableName.value> }}
   | <inTemplateLiteral?> {{                        <variableName.value> }}
   |                         <packageAlias.value> : <variableName.value>
   |                                                <variableName.value>
   ;

StringTemplateLiteral
   : string\u0020` <expressions>* `

Struct
   : <anonStruct?>                          <public?public> struct              { <fields-suffixed-by-;>* }
   |                <annotationAttachments>* <public?public> struct <name.value> { <fields-suffixed-by-;>* }
   ;

TernaryExpr
   : <condition.source> ? <thenExpression.source> : <elseExpression.source>
   ;

Throw
   : throw <expressions.source> ;
   ;

Transaction
   : transaction { <transactionBody.source> } failed { <failedBody.source> } aborted { <abortedBody.source> } committed { <committedBody.source> }
   | transaction { <transactionBody.source> }                                aborted { <abortedBody.source> } committed { <committedBody.source> }
   | transaction { <transactionBody.source> } failed { <failedBody.source> } aborted { <abortedBody.source> }
   | transaction { <transactionBody.source> } failed { <failedBody.source> }                                  committed { <committedBody.source> }
   | transaction { <transactionBody.source> } failed { <failedBody.source> }
   | transaction { <transactionBody.source> }                                                                 committed { <committedBody.source> }
   | transaction { <transactionBody.source> }                                aborted { <abortedBody.source> }
   | transaction { <transactionBody.source> }
   ;

Transform
   : transform { <body.source> }
   ;

Transformer
   : <public?public> transformer < <source.source> , <returnParameters-joined-by,>+ > <name.value> ( <parameters-joined-by,>* ) { <body.source> }
   | <public?public> transformer < <source.source> , <returnParameters-joined-by,>+ > <name.value> { <body.source> }
   | <public?public> transformer < <source.source> , <returnParameters-joined-by,>* >              { <body.source> }
   ;

Try
   : try { <body.source> } <catchBlocks>*  finally { <finallyBody.source> }
   | try { <body.source> } <catchBlocks>*
   ;

TypeCastExpr
   : ( <typeNode.source> ) <expression.source>
   ;

TypeConversionExpr
   : < <typeNode.source> , <transformerInvocation.source> > <expression.source>
   | < <typeNode.source> > <expression.source>
   ;

UnaryExpr
   : <operatorKind> <expression.source>
   ;

UserDefinedType
   : <anonStruct.source>
   | <packageAlias.value> : <typeName.value>
   | <typeName.value>
   |
   ;

ValueType
   : <typeKind>
   ;

Variable
   : <endpoint?>                                                      <typeNode.source> <name.value> { <initialExpression.source> ; }
   | <endpoint?>                                                      <typeNode.source> <name.value> { }
   | <global?> <annotationAttachments>* <public?public> <const?const> <typeNode.source> <name.value> = <initialExpression.source> ;
   | <global?> <annotationAttachments>*                               <typeNode.source> <name.value>                              ;
   |                                                                  <typeNode.source> <name.value> = <initialExpression.source>
   |           <annotationAttachments>*                               <typeNode.source> <name.value>
   |                                                                  <typeNode.source>
   ;

VariableDef
   : <endpoint?> endpoint <variable.source>
   : <variable.source> ;
   ;

While
   : while ( <condition.source> ) { <body.source> }
   ;

Worker
   : worker <name.value> { <body.source> }
   ;

WorkerReceive
   : <expressions-joined-by,>* <- <workerName.value> ;
   ;

WorkerSend
   : <forkJoinedSend?> <expressions-joined-by,>* -> fork ;
   |                   <expressions-joined-by,>* -> <workerName.value> ;
   ;

XmlAttribute
   : <name.source> = <value.source>
   ;

XmlAttributeAccessExpr
   : <expression.source> @ [ <index.source> ]
   | <expression.source> @
   ;

XmlCommentLiteral
   : <root?> xml` <!-- <textFragments>* --> `
   |              <!-- <textFragments>* -->
   ;

XmlElementLiteral
   : <root?> xml` < <startTagName.source> <attributes>* > <content>* </ <endTagName.source> > `
   :              < <startTagName.source> <attributes>* > <content>* </ <endTagName.source> >
   ;

XmlPiLiteral
   : <target.source> <dataTextFragments>*
   | <dataTextFragments>*
   | <target.source>
   ;

XmlQname
   : <prefix.value> : <localname.value>
   | <localname.value>
   ;

XmlQuotedString
   : <textFragments>*
   ;

XmlTextLiteral
   : <textFragments>*
   ;

Xmlns
   : xmlns <namespaceURI.source> as <prefix.value> ;
   | xmlns <namespaceURI.source> ;
   | <namespaceDeclaration.source>
   ;
