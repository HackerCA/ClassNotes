define(["bundles/assess/assessmentTypes/SessionModel","underscore","js/lib/q","bundles/assess/framework/QuestionCollection","bundles/assess/framework/QuestionModel"],function(SessionModel,_,Q,QuestionCollection,QuestionModel){var QuickQuestionsSessionModel=SessionModel.extend({defaults:{state:"nothing",assessmentId:"",classId:null,sessionId:"",question:null},submit:function(){var self=this;if(!_(["question","submit-error"]).contains(self.get("state")))throw"Called submit in not allowed state";if(null===self.get("question"))return;var question=self.get("question");self.set("state","submitting");var response=question.toResponseJson();self.callSessionAction("submitResponse",response).then(function(data){data.effectiveResponse=response,self.set("question",new QuestionModel(data)),self.set("state","feedback")},function(err){self.set("state","submit-error")}).done()},fetch:function(){var self=this;if(!_(["nothing"]).contains(self.get("state")))throw"Called fetch in not allowed state";if(!this.has("classId")||!this.has("assessmentId"))throw"Can't get assessment without a classId and an assessmentId";self.set("state","loading"),Q.fcall(function(){if(self.get("sessionId"))return self.get("sessionId");else return self.callGetOrCreateSession()}).then(function(sessionId){self.set("sessionId",sessionId),self.fetchQuestion()},function(err){self.set("state","load-error")}).done()},fetchQuestion:function(skip){var self=this;if(!(_(["feedback","loading"]).contains(self.get("state"))&&!skip||_(["question","submit-error"]).contains(self.get("state"))&&skip))throw"Called fetchQuestion in not allowed state!";self.set("state","loading"),self.callSessionAction(skip?"skipQuestion":"getCurrentQuestion",[]).then(function(data){if(null===data)self.set("question",null),self.set("state","no-more-questions");else self.set("question",new QuestionModel(data)),self.get("question").on("submit",self.submit,self),self.set("state","question")},function(err){self.set("state","load-error")}).done()}});return QuickQuestionsSessionModel});